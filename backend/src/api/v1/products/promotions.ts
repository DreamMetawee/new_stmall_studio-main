import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import prisma from "../../../libs/prisma"
import { createUploader } from "../../../utils/upload"
import fs from "fs"
import path from "path"
import logging from "../../../utils/logging"
import sharp from "sharp" // Import sharp library
import {
  IMG_MAX_WIDTH,
  IMG_MAX_HEIGHT,
  IMG_QUALITY,
} from "./../../../libs/config" // Import image constants

const router = Router()
const { uploader: upload, uploadDir } = createUploader("promotions")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/promotions")

    try {
      const promotions = await prisma.sliders.findMany({
        select: {
          id: true,
          image_url: true,
          title: true,
          description: true,
          link: true,
          status: true,
        },
      })

      const formattedPromotions = promotions.map(promotion => {
        return {
          id: promotion.id,
          image_url: promotion.image_url,
          name: promotion.title,
          description: promotion.description,
          link: promotion.link,
          status: promotion.status,
        }
      })

      res.json(formattedPromotions)
    } catch (error) {
      console.error("❌ Error fetching promotions:", error) // Add error logging
      res.status(500).json({ success: false, message: "Server error" }) // Send error response
    }
  }
)

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/promotions/create")

    const originalFilename = req.file ? req.file.filename : "" // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename)
      : ""
    let finalImageFilename = "" // Final filename to be saved in DB

    try {
      const user = req.user
      const { name, unit, description } = req.body
      const imageFile = req.file

      if (!name || !unit || !description || !imageFile) {
        // If data is incomplete, delete the uploaded file
        if (originalFilename && fs.existsSync(originalFilePath)) {
          fs.unlinkSync(originalFilePath)
        }
        res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน และอัปโหลดรูปภาพ",
        })
        return
      }

      if (imageFile) {
        // Generate new filename with timestamp to prevent collisions
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        // Resize and compress image using Sharp
        await sharp(originalFilePath)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside, // Maintain aspect ratio, don't crop, don't enlarge if smaller
            withoutEnlargement: true, // Do not enlarge image if original is smaller than target
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true }) // Compress to JPEG with specified quality
          .toFile(resizedFilePath)

        // Delete the original file uploaded by Multer
        fs.unlinkSync(originalFilePath)
      }

      const newPromotion = await prisma.sliders.create({
        data: {
          createur: user?.username || "system",
          title: name,
          link: unit,
          description,
          image_url: finalImageFilename || "", // Use the resized filename
          status: true, // Set default status to true or adjust as needed
        },
      })

      res.json({
        success: true,
        message: "เพิ่มโปรโมชั่นสำเร็จ",
        data: newPromotion,
      })
    } catch (error: any) {
      console.error("❌ Error creating promotion:", error)
      // If an error occurs, delete the uploaded files (both original and potentially resized)
      if (originalFilename && fs.existsSync(originalFilePath)) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 Deleted original uploaded file due to error: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn(
            "⚠️ Failed to delete original uploaded file:",
            unlinkError
          )
        }
      }
      if (
        finalImageFilename &&
        fs.existsSync(path.join(uploadDir, finalImageFilename))
      ) {
        try {
          fs.unlinkSync(path.join(uploadDir, finalImageFilename))
          console.log(
            `🧹 Deleted resized file due to error: ${finalImageFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ Failed to delete resized file:", unlinkError)
        }
      }
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" })
    }
  }
)

router.patch(
  "/update/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    const promotionId = Number(req.params.id)
    logging("PATCH", "v1", `/promotions/update/${promotionId}`)

    const originalFilename = req.file ? req.file.filename : undefined // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename!)
      : undefined
    let finalImageFilename: string | null | undefined = undefined // Final filename to be saved in DB

    try {
      const { name, unit, description, status } = req.body // Include status in destructuring
      const imageFile = req.file

      if (!name) {
        // If data is incomplete, delete the uploaded file
        if (
          originalFilename &&
          originalFilePath &&
          fs.existsSync(originalFilePath)
        ) {
          fs.unlinkSync(originalFilePath)
        }
        res
          .status(400)
          .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
        return
      }

      const existingPromotion = await prisma.sliders.findUnique({
        where: { id: promotionId },
      })

      if (!existingPromotion) {
        // If promotion not found, delete the newly uploaded file
        if (
          originalFilename &&
          originalFilePath &&
          fs.existsSync(originalFilePath)
        ) {
          try {
            fs.unlinkSync(originalFilePath)
            console.log(
              `🧹 Deleted uploaded file because promotion not found: ${originalFilename}`
            )
          } catch (unlinkError) {
            console.warn("⚠️ Failed to delete uploaded file:", unlinkError)
          }
        }
        res
          .status(404)
          .json({ success: false, message: "ไม่พบโปรโมชั่นที่ต้องการแก้ไข" })
        return
      }

      // If a new image is uploaded
      if (imageFile) {
        // Generate new filename with timestamp
        finalImageFilename = `resized_${Date.now()}_${originalFilename}`
        const resizedFilePath = path.join(uploadDir, finalImageFilename)

        // Resize and compress the new image
        await sharp(originalFilePath!)
          .resize({
            width: IMG_MAX_WIDTH,
            height: IMG_MAX_HEIGHT,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality: IMG_QUALITY, progressive: true })
          .toFile(resizedFilePath)

        // Delete the original file uploaded by Multer
        fs.unlinkSync(originalFilePath!)

        // Delete the old image file (if it exists)
        if (existingPromotion.image_url) {
          const oldFilePath = path.join(uploadDir, existingPromotion.image_url)
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath)
              console.log(
                `🧹 Deleted old promotion image: ${existingPromotion.image_url}`
              )
            }
          } catch (error) {
            console.warn("⚠️ Failed to delete old promotion image:", error)
          }
        }
      } else if (req.body.image === null) {
        // Case where client explicitly sends image: null to remove existing image
        if (existingPromotion.image_url) {
          const oldFilePath = path.join(uploadDir, existingPromotion.image_url)
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath)
              console.log(
                `🧹 Deleted old promotion image as requested: ${existingPromotion.image_url}`
              )
            } catch (error) {
              console.warn(
                "⚠️ Failed to delete old promotion image as requested:",
                error
              )
            }
          }
        }
        finalImageFilename = null // Set image_url to null in DB
      } else {
        // If no new image is uploaded, keep the existing one
        finalImageFilename = existingPromotion.image_url
      }

      const updatedPromotion = await prisma.sliders.update({
        where: { id: promotionId },
        data: {
          title: name,
          link: unit,
          description,
          image_url: finalImageFilename || "", // Use the resized filename or existing one
          status:
            status !== undefined
              ? Boolean(Number(status))
              : existingPromotion.status, // Update status if provided
        },
      })

      res.json({
        success: true,
        message: "อัปเดตโปรโมชั่นสำเร็จ",
        data: updatedPromotion,
      })
    } catch (error: any) {
      console.error("❌ Error updating promotion:", error)
      // If an error occurs, delete the newly uploaded files (both original and potentially resized)
      if (
        originalFilename &&
        originalFilePath &&
        fs.existsSync(originalFilePath)
      ) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 Deleted original uploaded file due to error: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn(
            "⚠️ Failed to delete original uploaded file:",
            unlinkError
          )
        }
      }
      if (
        finalImageFilename &&
        fs.existsSync(path.join(uploadDir, finalImageFilename))
      ) {
        try {
          fs.unlinkSync(path.join(uploadDir, finalImageFilename))
          console.log(
            `🧹 Deleted resized file due to error: ${finalImageFilename}`
          )
        } catch (unlinkError) {
          console.warn("⚠️ Failed to delete resized file:", unlinkError)
        }
      }
      res
        .status(500)
        .json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/promotions/delete/${req.params.id}`)

    try {
      const promotionId = Number(req.params.id)

      const existingPromotion = await prisma.sliders.findUnique({
        where: { id: promotionId },
      })

      if (!existingPromotion) {
        res.status(404).json({
          success: false,
          message: "ไม่พบโปรโมชั่นที่ต้องการลบ",
        })
        return
      }

      // Delete image file if it exists
      if (existingPromotion.image_url) {
        const filePath = path.join(uploadDir, existingPromotion.image_url)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
            console.log(
              `🧹 Deleted promotion image: ${existingPromotion.image_url}`
            )
          } catch (unlinkError) {
            console.warn("⚠️ Failed to delete promotion image:", unlinkError)
          }
        }
      }

      // Delete from database
      await prisma.sliders.delete({
        where: { id: promotionId },
      })

      res.json({
        success: true,
        message: "ลบโปรโมชั่นเรียบร้อยแล้ว",
      })
    } catch (error: any) {
      console.error("❌ Error deleting promotion:", error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      })
    }
  }
)

export default router
