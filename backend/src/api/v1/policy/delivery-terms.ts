import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายการจัดส่งทั้งหมดหรือแบบระบุ ID
router.get(
  "/:id?",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/delivery-terms/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let deliveryPolicies

      if (id) {
        const deliveryPolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            delivery_term_title: true,
            delivery_term_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!deliveryPolicy) {
        res.status(404).json({ message: "ไม่พบนโยบายการจัดส่ง" })
        }

        deliveryPolicies = [deliveryPolicy]
      } else {
        deliveryPolicies = await prisma.policy.findMany({
          select: {
            id: true,
            delivery_term_title: true,
            delivery_term_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: {
            type: "DELIVERY",
          },
        })
      }

      res.status(200).json(deliveryPolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายการจัดส่งใหม่
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("POST", "v1", "/delivery-terms/")

    try {
      const { delivery_term_title, delivery_term_content } = req.body

      if (!delivery_term_title || !delivery_term_content) {
        res.status(400).json({
          success: false,
          message: "ต้องระบุ delivery_term_title และ delivery_term_content",
        })
      }

      const existing = await prisma.policy.findFirst({
        where: { delivery_term_title },
      })

      if (existing) {
        res.status(400).json({
          success: false,
          message: "มีนโยบายการจัดส่งชื่อนี้อยู่แล้ว",
        })
      }

      const created = await prisma.policy.create({
        data: {
          delivery_term_title,
          delivery_term_content,
          type: "DELIVERY",
          created: new Date(),
          updated: new Date(),
        },
      })

      res.status(201).json({
        success: true,
        message: "สร้างนโยบายการจัดส่งสำเร็จ",
        data: created,
      })
    } catch (error: any) {
      console.error("❌ Error creating delivery term:", error)
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

// PATCH: อัปเดตนโยบายการจัดส่ง
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { delivery_term_title, delivery_term_content } = req.body
    logging("PATCH", "v1", `/delivery-terms/${id}`)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "ไม่พบนโยบายการจัดส่ง",
        })
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          delivery_term_title,
          delivery_term_content,
          updated: new Date(),
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายการจัดส่งสำเร็จ",
        data: updated,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาด",
        error,
      })
    }
  }
)

// DELETE: ลบนโยบายการจัดส่ง
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/delivery-terms/${req.params.id}`)

    try {
      await prisma.policy.delete({
        where: { id: Number(req.params.id) },
      })

      res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการลบ",
        error,
      })
    }
  }
)

export default router
