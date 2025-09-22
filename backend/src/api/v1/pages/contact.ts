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

const router = Router()
const { uploader: upload, uploadDir } = createUploader("contact")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/pages/contact`)

    try {
      const aboutUs = await prisma.about_us.findFirst({
        select: {
          contact_image: true,
          contact_name: true,
          sub_contact_name: true,
          contact_description: true,
          contact_position: true,
          contact_mobile: true,
          contact_phone: true,
          contact_email: true,
          contact_hour: true,
          contact_line: true,
          contact_facebook: true,
          contact_website: true,
          contact_google_map: true,
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
  upload.fields([{ name: "contact_image", maxCount: 1 }]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    logging("PATCH", "v1", `/pages/contact`)

    try {
      const user = req.user
      const body = req.body
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }

      const current = await prisma.about_us.findUnique({ where: { id: 1 } })

      const updatedData: Record<string, any> = {
        updateur: user?.username,
        ...(body.contact_name && { contact_name: body.contact_name }),
        ...(body.sub_contact_name && {
          sub_contact_name: body.sub_contact_name,
        }),
        ...(body.contact_description && {
          contact_description: body.contact_description,
        }),
        ...(body.contact_position && {
          contact_position: body.contact_position,
        }),
        ...(body.contact_phone && { contact_phone: body.contact_phone }),
        ...(body.contact_mobile && { contact_mobile: body.contact_mobile }),
        ...(body.contact_email && { contact_email: body.contact_email }),
        ...(body.contact_hour && { contact_hour: body.contact_hour }),
        ...(body.contact_line && { contact_line: body.contact_line }),
        ...(body.contact_facebook && {
          contact_facebook: body.contact_facebook,
        }),
        ...(body.contact_website && { contact_website: body.contact_website }),
        ...(body.contact_google_map && {
          contact_google_map: body.contact_google_map,
        }),
      }

      // ✅ อัปเดตรูปใหม่แบบไม่ใช้ loop
      if (files?.contact_image?.[0]) {
        const newFile = files.contact_image[0]
        const oldFilename = current?.contact_image

        if (oldFilename) {
          const oldPath = path.join(uploadDir, String(oldFilename))
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath)
          }
        }

        updatedData.contact_image = newFile.filename
      }

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
