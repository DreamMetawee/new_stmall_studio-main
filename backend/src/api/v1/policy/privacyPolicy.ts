import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายความเป็นส่วนตัว
router.get(
  "/:id?",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/privacy-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params

      let privacyPolicies

      if (id) {
        const privacyPolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            privacy_content: true,
            privacy_title: true,
            type:true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!privacyPolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายความเป็นส่วนตัว" })
          return
        }

        privacyPolicies = [privacyPolicy]
      } else {
        privacyPolicies = await prisma.policy.findMany({
          select: {
            id: true,
            privacy_content: true,
            privacy_title: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(privacyPolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายความเป็นส่วนตัวใหม่
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
  
      logging("POST", "v1", "/privacy-policy/")
  
      const firstPolicy = req.body[0]
      const { privacy_title, privacy_content } = firstPolicy
  
      if (!privacy_title || !privacy_content) {
        res.status(400).json({
          success: false,
          message: "ต้องระบุ privacy_title และ privacy_content",
        })
        return
      }
  
      try {
        const existing = await prisma.policy.findFirst({
          where: { privacy_title: privacy_title },
        })
  
        if (existing) {
          res.status(400).json({
            success: false,
            message: "มีนโยบายความเป็นส่วนตัวชื่อนี้อยู่แล้ว",
          })
          return
        }
  
        const created = await prisma.policy.create({
          data: {
            privacy_title,
            privacy_content,
            created: new Date(),
            updated: new Date(),
            type:"privacy",
            // ใส่ค่า default ให้ field อื่นด้วย (กัน Prisma error ถ้า schema บังคับไว้)
            cookie_title: "",
            cookie_content: "",
            exchange_content: "",
            condition_content: "",
          },
        })
  
        res.status(201).json({
          success: true,
          message: "สร้างนโยบายความเป็นส่วนตัวสำเร็จ",
          data: created,
        })
      } catch (error: any) {
        console.error("❌ Error creating policy:", error)
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
  

// PATCH: อัปเดตนโยบายความเป็นส่วนตัว
router.patch(
  "/privacyPolicy/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, content } = req.body
    logging("PATCH", "v1", `/privacy-policy/privacyPolicy/${id}`)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "ไม่พบนโยบายความเป็นส่วนตัว" })
        return
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          privacy_title: title,
          privacy_content: content,
          updated: new Date(),
        },
      })

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายความเป็นส่วนตัวสำเร็จ",
        data: updated,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// DELETE: ลบนโยบายความเป็นส่วนตัว
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/privacy-policy/:id`)

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
