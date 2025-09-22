import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import prisma from "../../../libs/prisma"
import { createUploader } from "../../../utils/upload"
import RESP_MSG from "../../../constants"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"
import { slugify } from "../../../utils/string"
import sharp from "sharp" // Import sharp library
import {
  IMG_MAX_HEIGHT,
  IMG_MAX_WIDTH,
  IMG_QUALITY,
} from "../../../libs/config"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("products")

// Enum values for product_type
const PRODUCT_TYPE_ENUM = ["TYPE_1", "TYPE_2", "TYPE_3", "TYPE_4", "TYPE_5"]

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/products")

    try {
      const products = await prisma.products.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          brand_id: true,
          type_id: true,
          image_url: true,
          price: true,
          regular_price: true,
          currency: true,
          product_type: true,
          unitname: true,
          status: true,
          size: true,
          weight: true,
        },
      })

      res.json(products)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error)
      res.status(500).json({ message: RESP_MSG.ERROR })
    }
  }
)

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/products/:id")

    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: "รหัสสินค้าไม่ถูกต้อง" })
        return
      }

      const products = await prisma.products.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          brand_id: true,
          type_id: true,
          image_url: true,
          price: true,
          regular_price: true,
          currency: true,
          product_type: true,
          unitname: true,
          status: true,
          size: true,
          weight: true,
          type: {
            select: {
              id: true,
              categorysub: {
                select: {
                  id: true,
                  category_id: true,
                },
              },
            },
          },
        },
      })

      if (!products) {
        res.status(404).json({ message: "ไม่พบข้อมูลสินค้า" })
        return
      }

      res.json(products)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าตาม ID:", error)
      res.status(500).json({ message: RESP_MSG.ERROR })
    }
  }
)

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/products/create")

    console.log(req.body)

    const originalFilename = req.file ? req.file.filename : ""
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename)
      : ""
    let finalImageFilename = ""

    try {
      const updateUser = req.user?.username

      const {
        name,
        unit,
        description,
        price,
        discountPrice,
        productType,
        displayType,
        displayStatus,
        brand,
        weight,
        size,
      } = req.body

      if (!name || !price || !productType || !brand || !weight || !size) {
        res.status(400).json({ message: RESP_MSG.MISSION_VALUE })
        if (originalFilename && fs.existsSync(originalFilePath)) {
          fs.unlinkSync(originalFilePath)
        }
        return
      }

      // Validate ขนาด: ควรเป็นฟอร์แมต wxlxh และแต่ละค่าต้องมากกว่า 0
      const sizeParts = String(size).split("x").map(Number)
      if (sizeParts.length !== 3 || sizeParts.some(v => isNaN(v) || v <= 0)) {
        res.status(400).json({
          message:
            "ขนาดสินค้าต้องอยู่ในรูปแบบ กว้างxยาวxสูง และแต่ละค่าต้องมากกว่า 0",
        })
        if (originalFilename && fs.existsSync(originalFilePath)) {
          fs.unlinkSync(originalFilePath)
        }
        return
      }

      // Validate product_type for enum
      let product_type = displayType || productType || "TYPE_1"
      if (!PRODUCT_TYPE_ENUM.includes(product_type)) {
        product_type = "TYPE_1"
      }

      if (req.file) {
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        await sharp(originalFilePath)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true })
          .toFile(resizedFilePath)

        fs.unlinkSync(originalFilePath)
      }

      const slugname = slugify(name)
      const product = await prisma.products.create({
        data: {
          name,
          slugname,
          unitname: unit,
          description,
          price: parseFloat(price),
          regular_price: discountPrice ? parseFloat(discountPrice) : null,
          type_id: Number(productType),
          brand_id: Number(brand),
          product_type,
          status: Boolean(Number(displayStatus)),
          image_url: finalImageFilename || null,
          createur: String(updateUser),
          weight: parseFloat(weight),
          size,
        },
      })

      res.status(201).json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: product,
      })
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการสร้างสินค้า:", error)
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
      res.status(500).json({ message: RESP_MSG.ERROR })
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    logging("PATCH", "v1", "/products/update/:id")

    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ message: "รหัสสินค้าไม่ถูกต้อง" })
      return
    }

    const originalFilename = req.file ? req.file.filename : undefined
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename!)
      : undefined
    let finalImageFilename: string | null | undefined = undefined

    try {
      const existingProduct = await prisma.products.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        res.status(404).json({ message: "ไม่พบข้อมูลสินค้า" })
        if (
          originalFilename &&
          originalFilePath &&
          fs.existsSync(originalFilePath)
        ) {
          try {
            fs.unlinkSync(originalFilePath)
            console.log(
              `🧹 ลบไฟล์ที่อัปโหลดเนื่องจากไม่พบสินค้า: ${originalFilename}`
            )
          } catch (unlinkError) {
            console.warn("⚠️ ไม่สามารถลบไฟล์ที่อัปโหลดได้:", unlinkError)
          }
        }
        return
      }

      const updateData: any = {}

      if (req.body.name) {
        updateData.name = req.body.name
        updateData.slugname = slugify(req.body.name)
      }
      if (req.body.unit) updateData.unitname = req.body.unit
      if (req.body.description) updateData.description = req.body.description
      if (req.body.price) updateData.price = parseFloat(req.body.price)
      if (req.body.discountPrice !== undefined)
        updateData.regular_price =
          req.body.discountPrice !== "" && req.body.discountPrice !== null
            ? parseFloat(req.body.discountPrice)
            : null
      if (req.body.productType)
        updateData.type_id = Number(req.body.productType)
      if (req.body.brand) updateData.brand_id = Number(req.body.brand)

      // Validate and fallback for enum value
      if (req.body.displayType) {
        updateData.product_type = PRODUCT_TYPE_ENUM.includes(
          req.body.displayType
        )
          ? req.body.displayType
          : "TYPE_1"
      }

      if (req.body.displayStatus !== undefined)
        updateData.status = Boolean(Number(req.body.displayStatus))
      if (req.body.weight) updateData.weight = parseFloat(req.body.weight)
      // size
      if (req.body.size) {
        // validate ขนาดก่อนอัพเดต
        const sizeParts = String(req.body.size).split("x").map(Number)
        if (sizeParts.length !== 3 || sizeParts.some(v => isNaN(v) || v <= 0)) {
          res.status(400).json({
            message:
              "ขนาดสินค้าต้องอยู่ในรูปแบบ กว้างxยาวxสูง และแต่ละค่าต้องมากกว่า 0",
          })
          // ลบไฟล์ใหม่ที่อัปโหลดถ้ามี
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
          return
        }
        updateData.size = req.body.size
      }

      if (req.file) {
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        await sharp(originalFilePath!)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true })
          .toFile(resizedFilePath)
        fs.unlinkSync(originalFilePath!)

        if (existingProduct.image_url) {
          const oldImagePath = path.join(uploadDir, existingProduct.image_url)
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath)
              console.log(`🧹 ลบไฟล์รูปภาพเก่า: ${existingProduct.image_url}`)
            }
          } catch (error) {
            console.warn("⚠️ ลบไฟล์รูปภาพเก่าไม่สำเร็จ:", error)
          }
        }
        updateData.image_url = finalImageFilename
      } else if (req.body.image === null) {
        if (existingProduct.image_url) {
          const oldImagePath = path.join(uploadDir, existingProduct.image_url)
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath)
              console.log(
                `🧹 ลบไฟล์รูปภาพเก่าตามคำขอ: ${existingProduct.image_url}`
              )
            } catch (error) {
              console.warn("⚠️ ไม่สามารถลบไฟล์รูปภาพเก่าตามคำขอได้:", error)
            }
          }
        }
        updateData.image_url = null
      }

      if (req.user?.username) updateData.updateur = req.user.username

      const updatedProduct = await prisma.products.update({
        where: { id },
        data: updateData,
      })

      res.status(200).json({
        success: true,
        message: RESP_MSG.SUCCESS_UPDATE,
        data: updatedProduct,
      })
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการอัปเดตสินค้า:", error)
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
      res.status(500).json({ message: RESP_MSG.ERROR })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    logging("DELETE", "v1", `/products/delete/${id}`)

    if (isNaN(id)) {
      res.status(400).json({ message: "รหัสสินค้าไม่ถูกต้อง" })
      return
    }

    try {
      const product = await prisma.products.findUnique({ where: { id } })

      if (!product) {
        res.status(404).json({ message: "ไม่พบสินค้า" })
        return
      }

      if (product.image_url) {
        const filePath = path.join(uploadDir, product.image_url)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
            console.log(`🧹 ลบไฟล์รูปภาพสินค้า: ${product.image_url}`)
          } catch (unlinkError) {
            console.warn("⚠️ ไม่สามารถลบไฟล์รูปภาพสินค้าได้:", unlinkError)
          }
        }
      }

      await prisma.products.delete({ where: { id } })
      res.json({ success: true, message: "ลบสินค้าสำเร็จ" })
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการลบสินค้า:", error)
      res.status(500).json({ message: RESP_MSG.ERROR })
    }
  }
)

export default router
