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

const router = Router()
const { uploader: upload, uploadDir } = createUploader("co-business")

// 📌 GET: Get all business groups
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (_req: Request, res: Response) => {
    logging("GET", "v1", `/pages/co-business`)

    try {
      const business = await prisma.business_groups.findMany({
        select: {
          id: true,
          name: true,
          logo_path: true,
          website_url: true,
        },
      })

      res.status(200).json({ success: true, data: business })
    } catch (error) {
      res.status(500).json({ success: false, message: "Server Error", error })
    }
  }
)

// ✅ POST: Create new business
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { name, website_url } = req.body
    const image = req.file
    logging("POST", "v1", `/pages/co-business/create`)

    try {
      if (!name || !website_url || !image) {
        res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" })
        return
      }

      const newBusiness = await prisma.business_groups.create({
        data: {
          name,
          website_url,
          logo_path: image.filename,
        },
      })

      res.status(200).json({
        success: true,
        message: "เพิ่มข้อมูลบริษัทสำเร็จ",
        data: newBusiness,
      })
    } catch (error) {
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// 🔁 PATCH: Update existing business
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, website_url } = req.body
    const image = req.file
    logging("PATCH", "v1", `/pages/co-business/update/${id}`)

    try {
      const existing = await prisma.business_groups.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ success: false, message: "ไม่พบข้อมูลบริษัท" })
        return
      }

      // ลบรูปภาพเก่า ถ้ามีรูปใหม่อัปโหลดมา
      if (image && existing.logo_path) {
        const oldPath = path.join(uploadDir, existing.logo_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      const updated = await prisma.business_groups.update({
        where: { id: Number(id) },
        data: {
          name,
          website_url,
          logo_path: image ? image.filename : existing.logo_path,
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
        data: updated,
      })
    } catch (error) {
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// DELETE: ลบข้อมูล
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/pages/co-business/delete/${id}`)

    try {
      const existing = await prisma.business_groups.findUnique({
        select: { logo_path: true },
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ success: false, message: "ไม่พบข้อมูลบริษัท" })
        return
      }

      // ลบรูปภาพเก่า ถ้ามีรูปใหม่อัปโหลดมา
      if (existing.logo_path) {
        const oldPath = path.join(uploadDir, existing.logo_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      await prisma.business_groups.delete({ where: { id: Number(id) } })
      res.status(200).json({ success: true, message: "ลบข้อมูลเรียบร้อย" })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "ไม่สามารถลบข้อมูลได้", error })
    }
  }
)

export default router
