import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import RESP_MSG from "../../../constants"
import logging from "../../../utils/logging"
import { slugify } from "../../../utils/string"

const router = Router()

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/groups/sub-category`)

    try {
      const subCategory = await prisma.categorysub.findMany({
        select: {
          id: true,
          name: true,
          category: {
            select: { id: true, name: true },
          },
          _count: { select: { types: true } },
        },
      })

      const formatData = subCategory.map(item => ({
        id: item.id,
        name: item.name,
        main_category_id: item.category.id,
        main_category_name: item.category.name,
        product_type_count: item._count.types,
      }))

      res.json(formatData)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { name, category } = req.body
    logging("POST", "v1", `/groups/sub-category/create`)

    try {
      const user = req.user

      const slugname = slugify(name)
      const results = await prisma.categorysub.create({
        data: {
          createur: String(user?.username),
          updateur: String(user?.username),
          name,
          slugname,
          category_id: category,
        },
      })

      if (results) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_CREATE })
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, category } = req.body
    logging("PATCH", "v1", `/groups/sub-category/update/${id}`)

    if (!name || !category) {
      res.json({
        success: false,
        message: RESP_MSG.MISSION_VALUE,
      })
      return
    }

    try {
      const username = req.user?.username
      // ตรวจสอบว่ามี sub-category ซ้ำในหมวดหมู่เดียวกันมั้ย (ยกเว้นตัวที่แก้ไขอยู่)
      const existing = await prisma.categorysub.findFirst({
        where: {
          name: String(name),
          category_id: Number(category),
          NOT: { id: Number(id) },
        },
      })

      if (existing) {
        throw new Error("มีชื่อหมวดหมู่นี้ในหมวดหมู่หลักนี้แล้ว")
      }

      const slugname = slugify(name)
      const result = await prisma.categorysub.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          category_id: Number(category),
          updateur: String(username),
        },
      })

      if (result) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_UPDATE })
      }
    } catch (error: any) {
      console.error("❌ UPDATE ERROR:", error)
      res.json({ success: false, message: error.message || RESP_MSG.ERROR })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/groups/sub-category/delete/${id}`)

    if (!id) {
      res.json({ success: false, message: RESP_MSG.MISSION_VALUE })
      return
    }

    try {
      const results = await prisma.categorysub.delete({
        where: { id: Number(id) },
      })

      if (results) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_DELETE })
      } else {
        throw new Error(RESP_MSG.FAILED_DELETE)
      }
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

export default router
