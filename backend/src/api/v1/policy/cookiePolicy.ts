import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายคุกกี้
router.get(
  "/:id?",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/cookie-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let cookiePolicies

      if (id) {
        const cookiePolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            cookie_content: true,
            cookie_title: true,
            type:true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!cookiePolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายคุกกี้" })
          
        }

        cookiePolicies = [cookiePolicy]
      } else {
        cookiePolicies = await prisma.policy.findMany({
          select: {
            id: true,
            cookie_content: true,
            cookie_title: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(cookiePolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายกล้องวงจรปิดใหม่ รองรับการเช็คชื่อซ้ำ
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("POST", "v1", "/cctv-policy/")
    console.log("📦 req.body =", req.body)

    try {
      const { cctv_title, cctv_content } = req.body

      if (!cctv_title || !cctv_content) {
        res.status(400).json({
          success: false,
          message: "ต้องระบุ cctv_title และ cctv_content",
        })
        return
      }

      const existing = await prisma.policy.findFirst({
        where: { cctv_title },
      })

      if (existing) {
        res.status(400).json({
          success: false,
          message: "มีนโยบายกล้องวงจรปิดชื่อนี้อยู่แล้ว",
        })
        return
      }

      const created = await prisma.policy.create({
        data: {
          cctv_title,
          cctv_content,
          type: "CCTV",
          created: new Date(),
          updated: new Date(),
        },
      })

      res.status(201).json({
        success: true,
        message: "สร้างนโยบายกล้องวงจรปิดสำเร็จ",
        data: created,
      })
    } catch (error: any) {
      console.error("❌ Error creating CCTV policy:", error)
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


// PATCH: อัปเดตนโยบายคุกกี้
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { cookie_title, cookie_content } = req.body
    console.log("📦 PATCH body =", req.body)

    logging("PATCH", "v1", `/cookie-policy/cookiePolicy/${id}`)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "ไม่พบนโยบายคุกกี้",
        })
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          cookie_title: cookie_title,
          cookie_content: cookie_content,
          updated: new Date(),
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายคุกกี้สำเร็จ",
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

// DELETE: ลบนโยบายคุกกี้
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/cookie-policy/${req.params.id}`)

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
