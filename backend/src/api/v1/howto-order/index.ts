import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import prisma from "../../../libs/prisma"
import logging from "../../../utils/logging"
import { createUploader } from "../../../utils/upload"
import fs from "fs"
import path from "path"

const router = Router()
const { uploader, uploadDir } = createUploader("hto-image")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/how-to-order`)
    try {
      const data = await prisma.howto_order.findMany({
        orderBy: { order_step: "asc" },
        select: {
          id: true,
          name: true,
          sub_name: true,
          description: true,
          image: true,
        },
      })

      res.json(data).status(200)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("GET", "v1", `/how-to-order/${id}`)
    try {
      const data = await prisma.howto_order.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          name: true,
          sub_name: true,
          description: true,
          image: true,
        },
      })

      if (!data) {
        res.status(404).json({ message: "FAQ not found" })
        return
      }

      res.status(200).json(data)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

// POST
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  uploader.single("image"),
  async (req: Request, res: Response) => {
    logging("POST", "v1", `/how-to-order`)
    try {
      const { name, sub_name, description } = req.body
      const file = req.file

      const data = await prisma.howto_order.create({
        data: {
          name,
          sub_name,
          description,
          image: file?.filename ?? "", // ✅ บันทึกแค่ชื่อ
        },
      })

      res.status(201).json(data)
    } catch (err) {
      if (req.file?.filename) {
        fs.unlinkSync(path.join(uploadDir, req.file.filename)) // ✅ ลบรูปถ้า error
      }
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

// PATCH
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  uploader.single("image"),
  async (req: Request, res: Response) => {
    logging("PATCH", "v1", `/how-to-order/:id`)
    try {
      const { id } = req.params
      const { name, sub_name, description } = req.body
      const file = req.file

      const existing = await prisma.howto_order.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        if (file?.filename) {
          fs.unlinkSync(path.join(uploadDir, file.filename))
        }
        res.status(404).json({ message: "Item not found" })
        return
      }

      if (file?.filename && existing.image) {
        fs.unlinkSync(path.join(uploadDir, existing.image))
      }

      const updated = await prisma.howto_order.update({
        where: { id: Number(id) },
        data: {
          name,
          sub_name,
          description,
          image: file?.filename ?? existing.image,
        },
      })

      res.status(200).json(updated)
    } catch (err) {
      console.log(err)
      if (req.file?.filename) {
        fs.unlinkSync(path.join(uploadDir, req.file.filename))
      }
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

router.patch(
  "/update-order",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("PATCH", "v1", `/how-to-order/update-order`)

    try {
      const { items } = req.body
      // ใช้ transaction เพื่ออัปเดตหลายรายการพร้อมกัน
      const updateOperations = items.map(
        (item: { id: number; order_step: number }) =>
          prisma.howto_order.update({
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

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const existing = await prisma.howto_order.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({ message: "Item not found" })
        return
      }

      if (existing.image) {
        fs.unlinkSync(path.join(uploadDir, existing.image))
      }

      await prisma.howto_order.delete({
        where: { id: Number(id) },
      })

      res.status(200).json({ message: "Deleted successfully" })
    } catch (err) {
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

export default router
