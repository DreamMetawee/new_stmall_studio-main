import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import { createUploader } from "../../../utils/upload"
import fs from "fs"
import path from "path"
import RESP_MSG from "../../../constants"
import logging from "../../../utils/logging"
import { slugify } from "../../../utils/string"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("our-store")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/pages/our-store`)

    try {
      const ourStore = await prisma.our_stores.findMany({
        select: {
          id: true,
          image: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          opening_hours: true,
          map_embed: true,
        },
      })

      const formatedData = ourStore.map(item => ({
        id: item.id,
        image: item.image,
        name: item.name,
        address: item.address,
        phone: item.phone,
        email: item.email,
        opening_hours: item.opening_hours,
        map_embed: item.map_embed,
      }))

      res.status(200).json(formatedData)
    } catch (error) {
      res.status(500).json(error)
    }
  }
)

router.post(
  "/create",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", `/pages/our-store/create`)

    try {
      const { name, address, phone, email, opening_hours, map_embed } = req.body
      if (
        !name ||
        !address ||
        !phone ||
        !email ||
        !opening_hours ||
        !map_embed ||
        !req.file
      ) {
        res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        })
        return
      }

      const slugname = slugify(name)
      const newStore = await prisma.our_stores.create({
        data: {
          name: name,
          slugname,
          address,
          phone,
          email,
          opening_hours,
          map_embed,
          image: req.file.filename,
        },
      })

      res.status(201).json({
        success: true,
        message: RESP_MSG.SUCCESS_CREATE,
        data: newStore,
      })
    } catch (error) {
      console.error("Create Our Store Error:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.FAILED_CREATE,
      })
    }
  }
)

router.patch(
  "/update/:id",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("PATCH", "v1", `/pages/our-store/update/${id}`)

    try {
      const { name, address, phone, email, opening_hours, map_embed } = req.body

      const existing = await prisma.our_stores.findUnique({
        where: { id: Number(id) },
      })

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลร้านค้านี้",
        })
        return
      }

      let updatedImage = existing.image

      if (req.file) {
        // ลบรูปเก่าหากมี
        const oldImagePath = path.join(uploadDir, existing.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
        updatedImage = req.file.filename
      }

      const slugname = slugify(name)
      const updated = await prisma.our_stores.update({
        where: { id: Number(id) },
        data: {
          name: name,
          slugname,
          address,
          phone,
          email,
          opening_hours,
          map_embed,
          image: updatedImage,
        },
      })

      res.status(200).json({
        success: true,
        message: RESP_MSG.SUCCESS_UPDATE,
        data: updated,
      })
    } catch (error) {
      console.error("Update Our Store Error:", error)
      res.status(500).json({
        success: false,
        message: RESP_MSG.FAILED_UPDATE,
      })
    }
  }
)

router.delete("/delete/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  logging("DELETE", "v1", `/pages/our-store/delete/${id}`)

  try {
    const existing = await prisma.our_stores.findUnique({
      where: { id: Number(id) },
    })

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลร้านค้านี้",
      })
      return
    }

    // ลบรูปภาพ
    const imagePath = path.join(uploadDir, existing.image)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    await prisma.our_stores.delete({ where: { id: Number(id) } })

    res.status(200).json({
      success: true,
      message: RESP_MSG.SUCCESS_DELETE,
    })
  } catch (error) {
    console.error("Delete Our Store Error:", error)
    res.status(500).json({
      success: false,
      message: RESP_MSG.FAILED_DELETE,
    })
  }
})

export default router
