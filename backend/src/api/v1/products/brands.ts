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
const { uploader: upload, uploadDir } = createUploader("brands")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/brands")

    try {
      const brands = await prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          logo_url: true,
          brand_description: true,
          website_link: true,
          status: true,
        },
      })

      res.json(brands)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

// CREATE BRAND
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/brands/create")

    try {
      const {
        name,
        unit, // will be website_link
        description,
      } = req.body

      const imagePath = req.file ? req.file.filename : ""

      const slugname = slugify(name)
      const newBrand = await prisma.brand.create({
        data: {
          name,
          slugname,
          logo_url: imagePath,
          website_link: unit,
          brand_description: description,
          createur: req.user?.username || "system",
          updateur: req.user?.username || "system",
        },
      })

      res.json({ success: true, message: "เพิ่มแบรนด์สำเร็จ", data: newBrand })
    } catch (error) {
      console.error("Error creating brand:", error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
    }
  }
)

// UPDATE BRAND
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, unit, description } = req.body
    logging("PATCH", "v1", `/brands/update/${id}`)

    try {
      const existingBrand = await prisma.brand.findUnique({
        where: { id: Number(id) },
      })

      if (!existingBrand) {
        res.status(404).json({ success: false, message: "ไม่พบแบรนด์" })
        return
      }

      // เตรียมลบไฟล์เก่าหากมีไฟล์ใหม่
      if (req.file && existingBrand.logo_url) {
        const oldImagePath = path.join(uploadDir, existingBrand.logo_url)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      const imagePath = req.file ? req.file.filename : undefined

      const slugname = slugify(name)
      const updatedBrand = await prisma.brand.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          website_link: unit,
          brand_description: description,
          updateur: req.user?.username || "system",
          ...(imagePath && { logo_url: imagePath }),
        },
      })

      res.json({
        success: true,
        message: "แก้ไขแบรนด์สำเร็จ",
        data: updatedBrand,
      })
    } catch (error) {
      console.error("Error updating brand:", error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
    }
  }
)

// DELETE /api/v1/brands/delete/:id
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params
  logging("DELETE", "v1", `/brands/delete/${id}`)

  try {
    const brand = await prisma.brand.findUnique({ where: { id: Number(id) } })

    if (!brand) {
      res.status(404).json({ success: false, message: "ไม่พบแบรนด์" })
      return
    }

    if (brand.logo_url) {
      const filePath = path.join(uploadDir, brand.logo_url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.brand.delete({ where: { id: Number(id) } })
    res.json({ success: true, message: "ลบแบรนด์เรียบร้อยแล้ว" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" })
  }
})

export default router
