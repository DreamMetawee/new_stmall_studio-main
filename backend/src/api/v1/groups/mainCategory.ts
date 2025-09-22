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
import { createUploader } from "../../../utils/upload"
import path from "path"
import fs from "fs"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("category-icons")

// Helper function to handle file upload
const handleFileUpload = (req: Request) => {
  if (!req.file) return null

  // Return relative path for database storage
  return req.file.filename
}

// Helper function to delete old icon file
const deleteOldIcon = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { icon: true },
  })

  if (category?.icon) {
    const filePath = path.join(uploadDir, category.icon)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/groups/main-category")

    try {
      const mainCategory = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          icon: true,
          _count: { select: { categorysub: true } },
        },
      })

      const formatData = mainCategory.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon ? `${item.icon}` : null,
        sub_category_count: item._count.categorysub,
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
  upload.single("icon"),
  async (req: AuthRequest, res: Response) => {
    const { name } = req.body
    logging("POST", "v1", "/groups/main-category/create")

    if (!name) {
      res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบ",
      })
      return
    }

    try {
      const updateUser = req.user?.username

      const checkCategory = await prisma.category.findFirst({
        where: {
          name: String(name),
        },
      })

      if (checkCategory) {
        res.status(400).json({
          success: false,
          message: "มีชื่อหมวดหมู่นี้แล้ว",
        })
        return
      }

      const iconPath = handleFileUpload(req)
      const slugname = slugify(name)

      const results = await prisma.category.create({
        data: {
          createur: String(updateUser),
          updateur: updateUser,
          name,
          slugname,
          icon: iconPath || "", // Set empty string if no icon
        },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: {
          ...results,
          icon: iconPath
            ? `${req.protocol}://${req.get("host")}/${iconPath}`
            : null,
        },
      })
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.status(500).json({
        success: false,
        message: error.message || RESP_MSG.FAILED_CREATE,
      })
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("icon"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name } = req.body
    logging("PATCH", "v1", `/groups/main-category/update/${id}`)

    if (!id || !name) {
      res.status(400).json({
        success: false,
        message: RESP_MSG.MISSION_VALUE,
      })
      return
    }

    try {
      const updateUser = req.user?.username

      // Check for duplicate name (excluding current category)
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: name,
          NOT: { id: Number(id) },
        },
      })

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: "มีชื่อหมวดหมู่นี้แล้ว",
        })
        return
      }

      // Handle icon update
      const iconPath = handleFileUpload(req)
      const slugname = slugify(name)

      // Delete old icon if new one is uploaded
      if (iconPath) {
        await deleteOldIcon(Number(id))
      }

      const updated = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          name,
          slugname,
          updateur: String(updateUser),
          ...(iconPath && { icon: iconPath }), // Only update icon if new one was uploaded
        },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_UPDATE,
        data: {
          ...updated,
          icon: updated.icon
            ? `${req.protocol}://${req.get("host")}/${updated.icon}`
            : null,
        },
      })
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.status(500).json({
        success: false,
        message: error.message || RESP_MSG.FAILED_UPDATE,
      })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/groups/main-category/delete/${id}`)

    if (!id) {
      res.status(400).json({
        success: false,
        message: RESP_MSG.MISSION_VALUE,
      })
      return
    }

    try {
      // Delete associated icon file first
      await deleteOldIcon(Number(id))

      const results = await prisma.category.delete({
        where: { id: Number(id) },
      })

      res.json({
        success: true,
        message: RESP_MSG.SUCCESS_DELETE,
      })
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.ERROR,
      })
    }
  }
)

export default router
