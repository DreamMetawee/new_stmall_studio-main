import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายกล้องวงจรปิด (CCTV)
router.get(
  "/",
  // authMiddleware,
  // permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/cctv-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let policies

      if (id) {
        const policy = await prisma.policy.findUnique({
          select: {
            id: true,
            cctv_title: true,
            cctv_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: 1 },
        })

        if (!policy) {
          res.status(404).json({ message: "ไม่พบนโยบายกล้องวงจรปิด" })
          return
        }

        policies = [policy]
      } else {
        policies = await prisma.policy.findMany({
          select: {
            id: true,
            cctv_title: true,
            cctv_content: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(policies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายกล้องวงจรปิดใหม่
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    console.log("📥 POST /cctv-policy/ ถูกเรียก")
    logging("POST", "v1", "/cctv-policy/")
    const { cctv_title, cctv_content } = req.body

    if (!cctv_title || !cctv_content) {
      res.status(400).json({
        success: false,
        message: "ต้องระบุ cctv_title และ cctv_content",
      })
      return
    }

    try {
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
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาด",
        error: {
          message: error.message,
          stack: error.stack,
        },
      })
    }
  }
)



// PATCH: อัปเดตนโยบายกล้องวงจรปิด
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, content } = req.body

    logging("PATCH", "v1", `/cctv-policy/${id}`)
    console.log("🔧 [CCTV PATCH] ID =", id)
    console.log("🔧 [CCTV PATCH] Request body =", req.body)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "ไม่พบนโยบายกล้องวงจรปิด" })
        return
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          cctv_title: title,
          cctv_content: content,
          updated: new Date(),
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายกล้องวงจรปิดสำเร็จ",
        data: updated,
      })
    } catch (error) {
      console.error("❌ [CCTV PATCH] Error occurred:", error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// DELETE: ลบนโยบายกล้องวงจรปิด
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/cctv-policy/:id`)

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
