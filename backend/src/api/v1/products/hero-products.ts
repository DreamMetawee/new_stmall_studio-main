import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import prisma from "../../../libs/prisma"
import { createUploader } from "../../../utils/upload"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"
import { slugify } from "../../../utils/string"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("hero-products")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/hero-products")

    try {
      const heroProducts = await prisma.productshero.findMany({
        select: {
          id: true,
          name: true,
          image_url: true,
          description: true,
          discount: true,
          link: true,
          status: true,
        },
      })

      res.json(heroProducts)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      })
    }
  }
)

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/hero-products/create")

    try {
      const user = req.user
      const { name, unit, description, status } = req.body
      const image = req.file
      const imageUrl = image ? image.filename : null

      const displayStatus = status === "1" // ✅ แก้ตรงนี้

      const slugname = slugify(name)
      const newHero = await prisma.productshero.create({
        data: {
          createur: String(user?.username),
          updateur: user?.username,
          name,
          slugname,
          link: unit,
          description,
          status: displayStatus, // ✅ ใช้ค่าที่แปลงแล้ว
          image_url: String(imageUrl),
        },
      })

      res.json({
        success: true,
        message: "สร้างสินค้าหลักสำเร็จ",
        data: newHero,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล",
      })
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, unit, description, status } = req.body
    logging("PATCH", "v1", `/hero-products/update/${id}`)

    try {
      const image = req.file
      const imageUrl = image ? image.filename : undefined

      const displayStatus = status === "1" // ✅ แก้ตรงนี้

      const oldHero = await prisma.productshero.findUnique({
        where: { id: Number(id) },
      })

      if (!oldHero) {
        res.status(404).json({ success: false, message: "ไม่พบข้อมูล" })
        return
      }

      if (imageUrl && oldHero.image_url) {
        const oldImagePath = path.join(uploadDir, oldHero.image_url)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      const slugname = slugify(name)
      const updatedHero = await prisma.productshero.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          link: unit,
          description,
          status: displayStatus, // ✅ ใช้ค่าที่แปลงแล้ว
          ...(imageUrl && { image_url: imageUrl }),
        },
      })

      res.json({
        success: true,
        message: "อัปเดตสินค้าหลักสำเร็จ",
        data: updatedHero,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
      })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/hero-products/delete/${id}`)

    try {
      const heroProduct = await prisma.productshero.findUnique({
        where: { id: Number(id) },
      })

      if (!heroProduct) {
        res.status(404).json({
          success: false,
          message: "ไม่พบสินค้าหลักที่ต้องการลบ",
        })
        return
      }

      // ลบไฟล์ภาพหากมี
      if (heroProduct.image_url) {
        const filePath = path.join(uploadDir, heroProduct.image_url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      // ลบจากฐานข้อมูล
      await prisma.productshero.delete({
        where: { id: Number(id) },
      })

      res.json({
        success: true,
        message: "ลบสินค้าหลักเรียบร้อยแล้ว",
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
      })
    }
  }
)

export default router
