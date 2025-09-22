import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import { createUploader } from "../../../utils/upload"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("employees")

// GET: ดึงข้อมูลทั้งหมด
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (_: Request, res: Response) => {
    logging("GET", "v1", `/pages/sale-team`)

    try {
      const aboutUs = await prisma.team_members.findMany({
        select: {
          id: true,
          name: true,
          position: true,
          description: true,
          image_path: true,
        },
      })

      res.status(200).json(aboutUs)
    } catch (error) {
      res.status(500).json(error)
    }
  }
)

// POST: สร้างข้อมูลใหม่
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { name, position, description } = req.body
    logging("POST", "v1", `/pages/sale-team/create`)

    if (!name || !position || !description || !req.file) {
      res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" })
      return
    }

    try {
      const newMember = await prisma.team_members.create({
        data: {
          name,
          position,
          description,
          image_path: req.file.filename,
        },
      })
      res.status(200).json({
        success: true,
        message: "สร้างข้อมูลเรียบร้อย",
        data: newMember,
      })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "ไม่สามารถสร้างข้อมูลได้", error })
    }
  }
)

// PATCH: แก้ไขข้อมูล
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, position, description } = req.body
    const image = req.file
    logging("PATCH", "v1", `/pages/sale-team/update/${id}`)

    try {
      const existing = await prisma.team_members.findUnique({
        select: { image_path: true },
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ success: false, message: "ไม่พบข้อมูลพนักงาน" })
        return
      }

      // ลบรูปภาพเก่า ถ้ามีรูปใหม่อัปโหลดมา
      if (image && existing.image_path) {
        const oldPath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      const updated = await prisma.team_members.update({
        where: { id: Number(id) },
        data: {
          name,
          position,
          description,
          image_path: image ? image.filename : existing.image_path,
        },
      })

      res
        .status(200)
        .json({ success: true, message: "อัปเดตสำเร็จ", data: updated })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "ไม่สามารถอัปเดตข้อมูลได้", error })
    }
  }
)

router.patch(
  "/update-order",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("PATCH", "v1", `/sale-team/update-order`)

    try {
      const { items } = req.body
      // ใช้ transaction เพื่ออัปเดตหลายรายการพร้อมกัน
      const updateOperations = items.map(
        (item: { id: number; order_step: number }) =>
          prisma.team_members.update({
            where: { id: item.id },
            data: { order_step: item.order_step },
          })
      )

      await prisma.$transaction(updateOperations)

      res.status(200).json({ message: "Updated order successfully" })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
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
    logging("DELETE", "v1", `/pages/sale-team/${id}`)

    try {
      const existing = await prisma.team_members.findUnique({
        select: { image_path: true },
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ success: false, message: "ไม่พบข้อมูลพนักงาน" })
        return
      }

      // ลบรูปภาพเก่า ถ้ามีรูปใหม่อัปโหลดมา
      if (existing.image_path) {
        const oldPath = path.join(uploadDir, existing.image_path)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      await prisma.team_members.delete({ where: { id: Number(id) } })
      res.status(200).json({ success: true, message: "ลบข้อมูลเรียบร้อย" })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "ไม่สามารถลบข้อมูลได้", error })
    }
  }
)

export default router
