import { IMG_MAX_HEIGHT, IMG_QUALITY } from "./../../../../libs/config"
import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../../middleware"
import prisma from "../../../../libs/prisma"
import { createUploader } from "../../../../utils/upload"
import fs from "fs"
import path from "path"
import sharp from "sharp" // Import sharp
import { IMG_MAX_WIDTH } from "../../../../libs/config"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("catalogImages")

router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.array("image", 10),
  async (req: Request, res: Response) => {
    const { catalogId } = req.body
    const files = req.files as Express.Multer.File[] | undefined

    if (!catalogId) {
      // ลบไฟล์ทั้งหมดถ้าไม่มี catalogId
      if (files && files.length > 0) {
        files.forEach(file => {
          fs.unlinkSync(path.join(uploadDir, file.filename))
        })
      }
      res.status(400).json({ message: "catalogId is required" })
      return
    }

    try {
      const createdImages = await Promise.all(
        files?.map(async file => {
          const originalFilePath = path.join(uploadDir, file.filename)
          const resizedFilename = `resized_${file.filename}` // ชื่อไฟล์ใหม่หลังปรับขนาด
          const resizedFilePath = path.join(uploadDir, resizedFilename)

          // ปรับขนาดรูปภาพโดยใช้ Sharp
          await sharp(originalFilePath)
            .resize({
              width: IMG_MAX_WIDTH,
              height: IMG_MAX_HEIGHT,
              fit: sharp.fit.inside, // รักษาสัดส่วน ไม่ตัดรูป และไม่ขยายหากรูปเล็กกว่า
              withoutEnlargement: true, // ไม่ขยายรูปภาพหากรูปต้นฉบับเล็กกว่าขนาดที่กำหนด
            })
            .jpeg({ quality: IMG_QUALITY }) // หรือ .png({ quality: IMAGE_QUALITY }) หรือ .webp({ quality: IMAGE_QUALITY })
            .toFile(resizedFilePath)

          // ลบไฟล์ต้นฉบับหลังจากที่ปรับขนาดแล้ว
          fs.unlinkSync(originalFilePath)

          // บันทึกข้อมูลรูปที่ปรับขนาดแล้วลง DB
          return prisma.catalogImage.create({
            data: {
              catalogId: Number(catalogId),
              image: resizedFilename, // ใช้ชื่อไฟล์ที่ปรับขนาดแล้ว
              createur: "", // ใส่ชื่อผู้สร้างถ้ามี
            },
          })
        }) || []
      )

      res.status(201).json(createdImages)
    } catch (err) {
      console.error(err)
      // ลบไฟล์ถ้ามี error
      if (files && files.length > 0) {
        files.forEach(file => {
          // ลองลบทั้งไฟล์ต้นฉบับและไฟล์ที่อาจจะถูกปรับขนาดแล้ว
          fs.unlink(path.join(uploadDir, file.filename), () => {})
          fs.unlink(path.join(uploadDir, `resized_${file.filename}`), () => {})
        })
      }
      res.status(500).json({ message: "Server error" })
    }
  }
)

// UPDATE
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const newImageFile = req.file // ชื่อไฟล์ใหม่ที่ถูกอัปโหลด
    const catalogId = req.body.catalogId // ควรดึง catalogId จาก req.body ด้วย

    try {
      const existing = await prisma.catalogImage.findUnique({
        where: { id },
      })

      if (!existing) {
        if (newImageFile)
          fs.unlinkSync(path.join(uploadDir, newImageFile.filename))
        res.status(404).json({ message: "Not found" })
        return
      }

      let finalImageFilename = existing.image

      if (newImageFile) {
        const originalFilePath = path.join(uploadDir, newImageFile.filename)
        const resizedFilename = `resized_${newImageFile.filename}`
        const resizedFilePath = path.join(uploadDir, resizedFilename)

        // ปรับขนาดรูปภาพใหม่
        await sharp(originalFilePath)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: IMG_QUALITY })
          .toFile(resizedFilePath)

        // ลบไฟล์ต้นฉบับที่อัปโหลดมา
        fs.unlinkSync(originalFilePath)

        // กำหนดชื่อไฟล์ใหม่ที่จะบันทึกลง DB
        finalImageFilename = resizedFilename

        // ลบไฟล์รูปเก่าออก
        if (existing.image) {
          fs.unlink(path.join(uploadDir, existing.image), err => {
            if (err) console.warn("Failed to delete old image:", err)
          })
        }
      }

      const updated = await prisma.catalogImage.update({
        where: { id },
        data: {
          image: finalImageFilename,
          catalogId: catalogId ? Number(catalogId) : existing.catalogId, // อัปเดต catalogId ถ้ามีการส่งมา
        },
      })

      res.json(updated)
    } catch (err) {
      console.error(err)
      if (newImageFile) {
        fs.unlink(path.join(uploadDir, newImageFile.filename), () => {}) // ลบไฟล์ต้นฉบับ
        fs.unlink(
          path.join(uploadDir, `resized_${newImageFile.filename}`),
          () => {}
        ) // ลบไฟล์ที่อาจจะถูกปรับขนาดแล้ว
      }
      res.status(500).json({ message: "Server error" })
    }
  }
)

// DELETE (ไม่มีการเปลี่ยนแปลง)
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
      const record = await prisma.catalogImage.findUnique({ where: { id } })

      if (!record) {
        res.status(404).json({ message: "Not found" })
        return
      }

      await prisma.catalogImage.delete({ where: { id } })

      if (record.image) {
        fs.unlink(path.join(uploadDir, record.image), err => {
          if (err) console.warn("Failed to delete image:", err)
        })
      }

      res.json({ message: "Deleted successfully" })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Server error" })
    }
  }
)

export default router
