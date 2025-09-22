import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายการแลกเปลี่ยน
router.get(
  "/:id?",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/exchange-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let exchangePolicies

      if (id) {
        const exchangePolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            exchange_content: true,
            exchange_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!exchangePolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายการแลกเปลี่ยน" })
          return
        }

        exchangePolicies = [exchangePolicy]
      } else {
        exchangePolicies = await prisma.policy.findMany({
          select: {
            id: true,
            exchange_content: true,
            exchange_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { type: "exchange" },
        })
      }

      res.status(200).json(exchangePolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายการแลกเปลี่ยนใหม่
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      res.status(400).json({
        success: false,
        message: "รูปแบบข้อมูลไม่ถูกต้อง: คาดหวัง Array ของนโยบาย",
      })
      return
    }

    logging("POST", "v1", "/exchange-policy/")

    const firstPolicy = req.body[0]
    const { exchange_title, exchange_content } = firstPolicy

    if (!exchange_title || !exchange_content) {
      res.status(400).json({
        success: false,
        message: "ต้องระบุ exchange_title และ exchange_content",
      })
      return
    }

    try {
      const existing = await prisma.policy.findFirst({
        where: { exchange_title },
      })

      if (existing) {
        res.status(400).json({
          success: false,
          message: "มีนโยบายการแลกเปลี่ยนชื่อนี้อยู่แล้ว",
        })
        return
      }

      const created = await prisma.policy.create({
        data: {
          exchange_title,
          exchange_content,
          created: new Date(),
          updated: new Date(),
          type: "exchange",
          // ค่า default สำหรับ field อื่น
          cookie_title: "",
          cookie_content: "",
          privacy_title: "",
          privacy_content: "",
          condition_content: "",
        },
      })

      res.status(201).json({
        success: true,
        message: "สร้างนโยบายการแลกเปลี่ยนสำเร็จ",
        data: created,
      })
    } catch (error: any) {
      console.error("❌ Error creating exchange policy:", error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดขณะสร้างนโยบาย",
        error: {
          message: error.message,
          stack: error.stack,
        },
      })
    }
  }
)

// PATCH: อัปเดตนโยบายการแลกเปลี่ยน
router.patch(
  "/exchangePolicy/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, content } = req.body
    logging("PATCH", "v1", `/exchange-policy/exchangePolicy/${id}`)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "ไม่พบนโยบายการแลกเปลี่ยน" })
        return
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          exchange_title: title,
          exchange_content: content,
          updated: new Date(),
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายการแลกเปลี่ยนสำเร็จ",
        data: updated,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// DELETE: ลบนโยบายการแลกเปลี่ยน
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/exchange-policy/:id`)

    const id = Number(req.params.id)

    try {
      await prisma.policy.delete({
        where: { id },
      })

      res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ", error })
    }
  }
)

export default router
