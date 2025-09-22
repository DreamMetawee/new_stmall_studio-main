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
const { uploader: upload, uploadDir } = createUploader("services")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/pages/services`)

    try {
      const services = await prisma.service_categories.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          image_path: true,
        },
      })

      res.json(services)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

router.get(
  "/:serviceId",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { serviceId } = req.params
    logging("GET", "v1", `/pages/services/${serviceId}`)

    try {
      const service = await prisma.service_categories.findUnique({
        where: { id: Number(serviceId) },
        select: {
          id: true,
          name: true,
          description: true,
          image_path: false,
          service_items: {
            select: {
              id: true,
              name: true,
              description: true,
              image_path: true,
            },
          },
        },
      })

      if (!service) {
        res.status(404).json({ message: "Service not found" })
        return
      }

      res.json(service)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

// CREATE
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", `/pages/services/create`)

    try {
      const { name, description } = req.body
      const imagePath = req.file ? req.file.filename : null

      if (!name) {
        res
          .status(400)
          .json({ success: false, message: "กรุณาระบุชื่อหมวดหมู่" })
        return
      }

      const slugname = slugify(name)
      const newCategory = await prisma.service_categories.create({
        data: {
          name,
          slugname,
          description,
          image_path: imagePath,
          createur: req.user?.username || "system",
          updateur: req.user?.username || "system",
        },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: newCategory,
      })
    } catch (error) {
      console.error("❌ CREATE ERROR:", error)
      res.status(500).json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

// UPDATE
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, description } = req.body
    logging("PATCH", "v1", `/pages/services/update/${id}`)

    try {
      const existing = await prisma.service_categories.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ message: "ไม่พบข้อมูล" })
        return
      }

      // ลบไฟล์เก่า (ถ้ามีอัปโหลดใหม่)
      if (req.file && existing.image_path) {
        const oldPath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      const imagePath = req.file ? req.file.filename : undefined

      const slugname = slugify(name)
      const updated = await prisma.service_categories.update({
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

// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/pages/services/delete/${id}`)

    try {
      const existing = await prisma.service_categories.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ message: "ไม่พบหมวดหมู่บริการ" })
        return
      }

      // ลบรูปเก่า (ถ้ามี)
      if (existing.image_path) {
        const filePath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }

      await prisma.service_categories.delete({ where: { id: Number(id) } })

      res.json({
        success: true,
        message: "ลบหมวดหมู่บริการเรียบร้อยแล้ว",
      })
    } catch (error) {
      console.error("❌ DELETE ERROR:", error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด" })
    }
  }
)

export default router
