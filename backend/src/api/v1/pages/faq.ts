import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import RESP_MSG from "../../../constants"

const router = Router()

// ✅ GET - ดึงรายการคำถามทั้งหมด
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/pages/faq`)

    try {
      const faqs = await prisma.faq.findMany({
        orderBy: { id: "desc" },
        select: {
          id: true,
          question: true,
          answer: true,
        },
      })

      res.status(200).json(faqs)
    } catch (error) {
      console.error("Get FAQ Error:", error)
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" })
    }
  }
)

// ✅ POST - สร้างคำถามใหม่
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", `/pages/faq/create`)

    try {
      const { question, answer } = req.body

      if (!question || !answer) {
        res.status(400).json({
          success: false,
          message: "กรุณาระบุคำถามและคำตอบ",
        })
      }

      const newFaq = await prisma.faq.create({
        data: { question, answer },
      })

      res.status(201).json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: newFaq,
      })
    } catch (error) {
      console.error("Create FAQ Error:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.FAILED_CREATE,
      })
    }
  }
)

// ✅ PATCH - แก้ไขคำถาม
router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("PATCH", "v1", `/pages/faq/update/${id}`)

    try {
      const { question, answer } = req.body

      const existing = await prisma.faq.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
            res.status(404).json({
        success: false,
        message: "ไม่พบคำถามนี้",
        })
      }

      const updated = await prisma.faq.update({
        where: { id: Number(id) },
        data: { question, answer },
      })

      res.status(200).json({
        success: true,
        message: RESP_MSG.SUCCESS_UPDATE,
        data: updated,
      })
    } catch (error) {
      console.error("Update FAQ Error:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.FAILED_UPDATE,
      })
    }
  }
)

// ✅ DELETE - ลบคำถาม
router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/pages/faq/delete/${id}`)

    try {
      const existing = await prisma.faq.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "ไม่พบคำถามนี้",
        })
      }

      await prisma.faq.delete({ where: { id: Number(id) } })

      res.status(200).json({
        success: true,
        message: RESP_MSG.SUCCESS_DELETE,
      })
    } catch (error) {
      console.error("Delete FAQ Error:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.FAILED_DELETE,
      })
    }
  }
)

export default router
