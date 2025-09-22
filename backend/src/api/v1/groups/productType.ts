import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
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
    logging("GET", "v1", `/groups/product-type`)

    try {
      const productType = await prisma.type.findMany({
        select: {
          id: true,
          name: true,
          categorysub: {
            select: {
              id: true,
              name: true, // ชื่อหมวดหมู่ย่อย
              category: {
                select: {
                  name: true, // ชื่อหมวดหมู่หลัก
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      })

      const formatData = productType.map(item => ({
        id: item.id,
        name: item.name,
        main_category_name: item.categorysub.category.name,
        sub_category: item.categorysub.id,
        sub_category_name: item.categorysub.name,
        product_count: item._count.products,
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
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    const { name, sub_category } = req.body
    logging("POST", "v1", `/groups/product-type/create`)

    if (!name || !sub_category) {
      res.json({ success: false, message: RESP_MSG.MISSION_VALUE })
      return
    }

    try {
      const slugname = slugify(name)
      const results = await prisma.type.create({
        data: {
          name,
          slugname,
          categorysub_id: sub_category,
        },
      })

      if (results) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_CREATE })
      } else {
        throw new Error(RESP_MSG.FAILED_DELETE)
      }
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, sub_category } = req.body
    logging("POST", "v1", `/groups/product-type/update/${id}`)

    try {
      const slugname = slugify(name)
      const updated = await prisma.type.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          categorysub_id: sub_category,
        },
      })

      if (updated) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_UPDATE })
      } else throw new Error(RESP_MSG.ERROR)
    } catch (error: any) {
      console.error("❌ UPDATE ERROR:", error)
      res.json({ success: false, message: RESP_MSG.ERROR })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/groups/product-type/delete/${id}`)

    if (!id) {
      res.json({ success: false, message: RESP_MSG.MISSION_VALUE })
      return
    }

    try {
      const results = await prisma.type.delete({
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
