import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายเงื่อนไข
router.get(
  "/:id?",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/condition-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params

      let conditions

      if (id) {
        const condition = await prisma.policy.findUnique({
          select: {
            id: true,
            condition_content: true,
            condition_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!condition) {
          res.status(404).json({ message: "ไม่พบนโยบายเงื่อนไข" })
          return
        }

        conditions = [condition]
      } else {
        conditions = await prisma.policy.findMany({
          select: {
            id: true,
            condition_content: true,
            condition_title: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(conditions)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// POST: สร้างนโยบายเงื่อนไขใหม่
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

    logging("POST", "v1", "/condition-policy/")

    const firstCondition = req.body[0]
    const { condition_title, condition_content } = firstCondition

    if (!condition_title || !condition_content) {
      res.status(400).json({
        success: false,
        message: "ต้องระบุ condition_title และ condition_content",
      })
      return
    }

    try {
      const existing = await prisma.policy.findFirst({
        where: { condition_title: condition_title },
      })

      if (existing) {
        res.status(400).json({
          success: false,
          message: "มีนโยบายเงื่อนไขชื่อนี้อยู่แล้ว",
        })
        return
      }

      const created = await prisma.policy.create({
        data: {
          condition_title,
          condition_content,
          created: new Date(),
          updated: new Date(),
          type: "condition",
        },
      })

      res.status(201).json({
        success: true,
        message: "สร้างนโยบายเงื่อนไขสำเร็จ",
        data: created,
      })
    } catch (error: any) {
      console.error("❌ Error creating condition policy:", error)
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

// PATCH: อัปเดตนโยบายเงื่อนไข
router.patch(
  "/conditionPolicy/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, content } = req.body

    logging("PATCH", "v1", `/condition-policy/${id}`)
    console.log("🔧 [Condition PATCH] ID =", id)
    console.log("🔧 [Condition PATCH] Request body =", req.body)

    try {
      const existing = await prisma.policy.findUnique({
        where: { id: Number(id) },
      })

      console.log("🔎 [Condition PATCH] Existing policy =", existing)

      if (!existing) {
        res.status(404).json({ success: false, message: "ไม่พบนโยบายเงื่อนไข" })
        return
      }

      const updated = await prisma.policy.update({
        where: { id: Number(id) },
        data: {
          condition_title: title,
          condition_content: content,
          updated: new Date(),
        },
      })

      console.log("✅ [Condition PATCH] Updated policy =", updated)

      res.status(200).json({
        success: true,
        message: "อัปเดตนโยบายเงื่อนไขสำเร็จ",
        data: updated,
      })
    } catch (error) {
      console.error("❌ [Condition PATCH] Error occurred:", error)
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error })
    }
  }
)

// DELETE: ลบนโยบายเงื่อนไข
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/condition-policy/:id`)

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
