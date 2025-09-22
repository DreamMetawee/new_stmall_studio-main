import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../../middleware"
import prisma from "../../../../libs/prisma"
import { createUploader } from "../../../../utils/upload"
import fs from "fs"
import path from "path"
import logging from "../../../../utils/logging"
import { slugify } from "../../../../utils/string"
import sharp from "sharp" // Import sharp library
import {
  IMG_MAX_HEIGHT,
  IMG_MAX_WIDTH,
  IMG_QUALITY,
} from "../../../../libs/config"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("catalog")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/catalog")

    try {
      const catalog = await prisma.catalog.findMany({
        select: {
          id: true,
          name: true,
          slugname: true,
          catalog_img: true,
          catalog_link: true,
          category_id: true,
          status: true,
          category: true,
          catelogImages: {
            select: {
              id: true,
              image: true,
            },
          },
          _count: {
            select: {
              catelogImages: true,
            },
          },
        },
      })

      const formattedData = catalog.map(i => ({
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        image: i.catalog_img,
        item_count: i._count.catelogImages,
      }))

      res.json(formattedData)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

router.get(
  "/:catalogId",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const catalogId = Number(req.params.catalogId)
      const data = await prisma.catalog.findFirst({
        where: { id: catalogId },
        select: {
          id: true,
          name: true,
          slugname: true,
          category: { select: { id: true } },
          catalog_img: true,
          catelogImages: {
            select: {
              id: true,
              image: true,
              catalogId: true,
            },
          },
        },
      })

      if (!data) {
        res.status(404).json({ message: "Not found" })
        return
      }

      const formattedData = {
        id: data.id,
        name: data.name,
        slugname: data.slugname,
        category_id: data.category?.id,
        image: data.catalog_img,
        lists: data.catelogImages.map(item => ({
          id: item.id,
          image: item.image,
          name: item?.catalogId, // This might be a typo, usually you'd want a name here
        })),
      }

      res.json(formattedData)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Server error" }) // เพิ่มการจัดการ error
    }
  }
)

// CREATE catalog
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("catalog_img"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/catalog/create")

    const originalFilename = req.file ? req.file.filename : "" // ชื่อไฟล์ที่ Multer อัปโหลด
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename)
      : ""
    let finalImageFilename = "" // ชื่อไฟล์สุดท้ายที่จะบันทึกลง DB

    try {
      const { name, unit, category_id } = req.body

      if (req.file) {
        // สร้างชื่อไฟล์ใหม่พร้อม timestamp เพื่อป้องกันชื่อซ้ำ
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        // ปรับขนาดและบีบอัดรูปภาพด้วย Sharp
        await sharp(originalFilePath)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside, // รักษาสัดส่วน ไม่ตัดรูป และไม่ขยายหากรูปเล็กกว่า
            withoutEnlargement: true, // ไม่ขยายรูปภาพหากรูปต้นฉบับเล็กกว่าขนาดที่กำหนด
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true }) // บีบอัดเป็น JPEG พร้อมคุณภาพที่กำหนด
          .toFile(resizedFilePath)

        // ลบไฟล์ต้นฉบับที่ Multer อัปโหลดมา
        fs.unlinkSync(originalFilePath)
      }

      const slugname = slugify(name)
      const newCatalog = await prisma.catalog.create({
        data: {
          name,
          slugname,
          catalog_img: finalImageFilename, // ใช้ชื่อไฟล์ที่ปรับขนาดแล้ว
          catalog_link: unit,
          category_id: Number(category_id),
          status: true,
          createur: req.user?.username || "system",
          updateur: req.user?.username || "system",
        },
      })

      res.json({
        success: true,
        message: "เพิ่มแคตตาล็อกสำเร็จ",
        data: newCatalog,
      })
    } catch (error) {
      console.error("Error creating catalog:", error)

      // ถ้ามีไฟล์ที่อัปโหลด แล้วเกิด error ต้องลบไฟล์ทิ้ง (ทั้งไฟล์ต้นฉบับและไฟล์ที่ปรับขนาดแล้ว)
      if (originalFilename && fs.existsSync(originalFilePath)) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 ลบไฟล์ต้นฉบับที่อัปโหลดเนื่องจากเกิด error: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ ไม่สามารถลบไฟล์ต้นฉบับได้:", unlinkError)
        }
      }
      if (
        finalImageFilename &&
        fs.existsSync(path.join(uploadDir, finalImageFilename))
      ) {
        try {
          fs.unlinkSync(path.join(uploadDir, finalImageFilename))
          console.log(
            `🧹 ลบไฟล์ที่ปรับขนาดแล้วเนื่องจากเกิด error: ${finalImageFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ ไม่สามารถลบไฟล์ที่ปรับขนาดแล้วได้:", unlinkError)
        }
      }

      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
    }
  }
)

// UPDATE catalog
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("catalog_img"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, unit, category_id, status } = req.body
    logging("PATCH", "v1", `/catalog/update/${id}`)

    const originalFilename = req.file ? req.file.filename : undefined // ชื่อไฟล์ที่ Multer อัปโหลด
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename!)
      : undefined
    let finalImageFilename: string | undefined = undefined // ชื่อไฟล์สุดท้ายที่จะบันทึกลง DB

    try {
      const existingCatalog = await prisma.catalog.findUnique({
        where: { id: Number(id) },
      })

      if (!existingCatalog) {
        res.status(404).json({ success: false, message: "ไม่พบแคตตาล็อก" })

        // ลบไฟล์ที่เพิ่งอัปโหลด (เพราะไม่เจอข้อมูล)
        if (
          originalFilename &&
          originalFilePath &&
          fs.existsSync(originalFilePath)
        ) {
          try {
            fs.unlinkSync(originalFilePath)
            console.log(
              `🧹 ลบไฟล์ที่อัปโหลดเนื่องจากไม่พบแคตตาล็อก: ${originalFilename}`
            )
          } catch (unlinkError) {
            console.warn("⚠️ ไม่สามารถลบไฟล์ที่อัปโหลดได้:", unlinkError)
          }
        }
        return
      }

      // ถ้ามีการอัปโหลดไฟล์รูปภาพใหม่
      if (req.file) {
        // สร้างชื่อไฟล์ใหม่พร้อม timestamp
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        // ปรับขนาดและบีบอัดรูปภาพใหม่
        await sharp(originalFilePath!)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true })
          .toFile(resizedFilePath)

        // ลบไฟล์ต้นฉบับที่ Multer อัปโหลดมา
        fs.unlinkSync(originalFilePath!)

        // ลบไฟล์รูปเก่าออก (ถ้ามี)
        if (existingCatalog.catalog_img) {
          const oldFilePath = path.join(uploadDir, existingCatalog.catalog_img)
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath)
              console.log(`🧹 ลบไฟล์เก่า: ${existingCatalog.catalog_img}`)
            }
          } catch (error) {
            console.warn("⚠️ ลบไฟล์เก่าไม่สำเร็จ:", error)
          }
        }
      } else {
        // ถ้าไม่มีการอัปโหลดไฟล์ใหม่ ให้ใช้ชื่อไฟล์เดิม
        finalImageFilename = existingCatalog.catalog_img || undefined
      }

      const slugname = slugify(name)
      const updatedCatalog = await prisma.catalog.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          catalog_link: unit,
          catalog_img: finalImageFilename, // ใช้ชื่อไฟล์ที่ปรับขนาดแล้ว หรือชื่อไฟล์เดิม
          category_id: Number(category_id),
          status: status === "1",
          updateur: req.user?.username || "system",
        },
      })

      res.json({
        success: true,
        message: "แก้ไขแคตตาล็อกสำเร็จ",
        data: updatedCatalog,
      })
    } catch (error) {
      console.error("Error updating catalog:", error)

      // ลบไฟล์ใหม่ที่อัปโหลดถ้าเกิด error (ทั้งไฟล์ต้นฉบับและไฟล์ที่ปรับขนาดแล้ว)
      if (
        originalFilename &&
        originalFilePath &&
        fs.existsSync(originalFilePath)
      ) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 ลบไฟล์ต้นฉบับที่อัปโหลดเนื่องจาก error: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ ไม่สามารถลบไฟล์ต้นฉบับได้:", unlinkError)
        }
      }
      if (
        finalImageFilename &&
        fs.existsSync(path.join(uploadDir, finalImageFilename))
      ) {
        try {
          fs.unlinkSync(path.join(uploadDir, finalImageFilename))
          console.log(
            `🧹 ลบไฟล์ที่ปรับขนาดแล้วเนื่องจาก error: ${finalImageFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ ไม่สามารถลบไฟล์ที่ปรับขนาดแล้วได้:", unlinkError)
        }
      }

      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
    }
  }
)

router.delete("/delete/:id", async (req: Request, res: Response) => {
  const { id } = req.params
  logging("DELETE", "v1", `/catalog/delete/${id}`)

  try {
    const catalogId = Number(id)

    const catalog = await prisma.catalog.findUnique({
      where: { id: catalogId },
    })

    if (!catalog) {
      res.status(404).json({ success: false, message: "ไม่พบแคตตาล็อก" })
      return
    }

    // ลบไฟล์รูปแคตตาล็อกหลัก
    if (catalog.catalog_img) {
      const filePath = path.join(uploadDir, catalog.catalog_img)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
          console.log(`🧹 ลบไฟล์รูปแคตตาล็อกหลัก: ${catalog.catalog_img}`)
        } catch (unlinkError) {
          console.warn("⚠️ ไม่สามารถลบไฟล์รูปแคตตาล็อกหลักได้:", unlinkError)
        }
      }
    }

    // 🔥 ลบภาพทั้งหมดที่อยู่ใน catalog นี้ (สมมติว่าไฟล์รูปภาพเหล่านั้นถูกจัดการใน route อื่น)
    // หากต้องการลบไฟล์รูปภาพย่อยๆ ด้วย ต้องแน่ใจว่าได้ดึงชื่อไฟล์มาจาก DB ก่อนแล้วค่อยลบ
    const catalogImages = await prisma.catalogImage.findMany({
      where: { catalogId: catalogId },
      select: { image: true },
    })

    for (const img of catalogImages) {
      const imagePath = path.join(uploadDir, img.image)
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath)
          console.log(`🧹 ลบไฟล์รูปภาพย่อย: ${img.image}`)
        } catch (unlinkError) {
          console.warn(
            `⚠️ ไม่สามารถลบไฟล์รูปภาพย่อย ${img.image} ได้:`,
            unlinkError
          )
        }
      }
    }

    await prisma.catalogImage.deleteMany({
      where: { catalogId: catalogId },
    })

    // 🔥 ลบ catalog
    await prisma.catalog.delete({
      where: { id: catalogId },
    })

    res.json({ success: true, message: "ลบแคตตาล็อกเรียบร้อยแล้ว" })
  } catch (error) {
    console.error("❌ ลบแคตตาล็อกผิดพลาด:", error)
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
  }
})

export default router
