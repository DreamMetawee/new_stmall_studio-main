import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import { createUploader } from "../../../utils/upload"
import RESP_MSG from "../../../constants"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"
import { slugify } from "../../../utils/string"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("service-items")

// POST: สร้าง service_item ใหม่
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", `/pages/service-item/create`)

    try {
      const { name, description, service_category_id } = req.body
      const imagePath = req.file ? req.file.filename : null

      if (!name || !service_category_id) {
        res.status(400).json({
          success: false,
          message: "กรุณาระบุชื่อและหมวดหมู่บริการ",
        })
        return
      }

      const slugname = slugify(name)
      const newItem = await prisma.service_items.create({
        data: {
          name,
          slugname,
          description,
          image_path: imagePath,
          category_id: Number(service_category_id),
          createur: req.user?.username || "system",
          updateur: req.user?.username || "system",
        },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: newItem,
      })
    } catch (error) {
      console.error("❌ CREATE ERROR:", error)
      res.status(500).json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

// PATCH: แก้ไข service_item ที่มีอยู่
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, description } = req.body
    logging("PATCH", "v1", `/pages/service-item/update/${id}`)

    try {
      const existing = await prisma.service_items.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ message: "ไม่พบข้อมูล" })
        return
      }

      // ลบไฟล์รูปภาพเก่า (ถ้ามีการอัปโหลดใหม่)
      if (req.file && existing.image_path) {
        const oldPath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      const imagePath = req.file ? req.file.filename : undefined

      const slugname = slugify(name)
      const updated = await prisma.service_items.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          description,
          updateur: req.user?.username || "system",
          ...(imagePath && { image_path: imagePath }),
        },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_UPDATE,
        data: updated,
      })
    } catch (error) {
      console.error("❌ UPDATE ERROR:", error)
      res.status(500).json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

// DELETE: ลบ service_item
router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/pages/service-item/delete/${id}`)

    try {
      const existing = await prisma.service_items.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ message: "ไม่พบรายการบริการ" })
        return
      }

      // ลบไฟล์รูปภาพ (ถ้ามี)
      if (existing.image_path) {
        const filePath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }

      await prisma.service_items.delete({ where: { id: Number(id) } })

      res.json({
        success: true,
        message: "ลบรายการบริการเรียบร้อยแล้ว",
      })
    } catch (error) {
      console.error("❌ DELETE ERROR:", error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด" })
    }
  }
)

export default router
