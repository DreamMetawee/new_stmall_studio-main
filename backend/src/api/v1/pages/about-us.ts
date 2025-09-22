import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import { createUploader } from "../../../utils/upload"
import RESP_MSG from "../../../constants"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("about-us")

// EVERY UPDATE USING ID 1

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/pages/about-us`)

    try {
      const aboutUs = await prisma.about_us.findFirst({
        select: {
          our_vision: true,
          our_mission: true,
          record_title: true,
          record_subtitle: true,
          business_title: true,
          business_content: true,
          hero_image: true,
          record_image_1st: true,
          record_image_2nd: true,
          record_image_3rd: true,
          record_image_4th: true,
          record_image_5th: true,
          record_image_6th: true,
        },
        where: { id: 1 },
      })

      res.status(200).json(aboutUs)
    } catch (error) {
      res.status(500).json(error)
    }
  }
)

//? This route is used to update the background image for about page
router.patch(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.fields([
    { name: "hero_image", maxCount: 1 },
    { name: "record_image_1st", maxCount: 1 },
    { name: "record_image_2nd", maxCount: 1 },
    { name: "record_image_3rd", maxCount: 1 },
    { name: "record_image_4th", maxCount: 1 },
    { name: "record_image_5th", maxCount: 1 },
    { name: "record_image_6th", maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    logging("PATCH", "v1", `/pages/about-us`)

    try {
      const user = req.user
      const body = req.body
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[]
      }

      // Get current image names to delete them later if replaced
      const current = await prisma.about_us.findUnique({ where: { id: 1 } })

      const updatedData: Record<string, any> = {
        updateur: user?.username?.trim(),
        our_vision: body.vision?.trim(),
        our_mission: body.mission?.trim(),
        record_title: body.record_title?.trim(),
        record_subtitle: body.record_subtitle?.trim(),
        business_title: body.business_title?.trim(),
        business_content: body.business_content?.trim(),
      }

      const imageFields = [
        "hero_image",
        "record_image_1st",
        "record_image_2nd",
        "record_image_3rd",
        "record_image_4th",
        "record_image_5th",
        "record_image_6th",
      ]

      imageFields.forEach(field => {
        if (files?.[field]?.[0]) {
          const newFile = files[field][0]
          const oldFilename = current?.[field as keyof typeof current]

          // Delete old file if it exists
          if (oldFilename) {
            const oldPath = path.join(uploadDir, String(oldFilename))
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath)
            }
          }

          // Update new filename
          updatedData[field] = newFile.filename
        }
      })

      const aboutUs = await prisma.about_us.update({
        where: { id: 1 },
        data: updatedData,
      })

      res.status(200).json({ message: RESP_MSG.SUCCESS_UPDATE, data: aboutUs })
    } catch (error) {
      console.error("Update error:", error)
      res.status(500).json({ message: "Failed to update", error })
    }
  }
)

export default router
