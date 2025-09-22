import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
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
const { uploader: upload, uploadDir } = createUploader("sub-decobystyles")

// CREATE
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    logging("POST", "v1", "/subdcbs")
    const { dcbsId, sub_dcbs } = req.body
    const originalFilename = req.file?.filename || "" // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename)
      : ""
    let finalImageFilename = "" // Final filename to be saved in DB

    if (!dcbsId || !sub_dcbs) {
      // If required fields are missing, delete the uploaded file
      if (originalFilename && fs.existsSync(originalFilePath)) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 Deleted original uploaded file due to missing fields: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn(
            "⚠️ Failed to delete original uploaded file:",
            unlinkError
          )
        }
      }
      res.status(400).json({ message: "Required fields missing" })
      return
    }

    try {
      if (req.file) {
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

      const result = await prisma.dcbsSubCategory.create({
        data: {
          decoByStylesId: Number(dcbsId),
          subCategoryId: Number(sub_dcbs),
          image: finalImageFilename || "", // Use the resized filename or null if no image
        },
      })

      res.status(201).json(result)
    } catch (err) {
      console.error("❌ Error creating sub-decobystyles:", err)
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
      res.status(500).json({ message: "Server error" })
    }
  }
)

// UPDATE
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    logging("PATCH", "v1", "/subdcbs/:id")
    const id = Number(req.params.id)
    const { dcbsId, sub_dcbs } = req.body
    const originalFilename = req.file?.filename // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename!)
      : undefined
    let finalImageFilename: string | null | undefined = undefined // Final filename to be saved in DB

    try {
      const existing = await prisma.dcbsSubCategory.findUnique({
        where: { id },
      })

      if (!existing) {
        // If record not found, delete the newly uploaded file
        if (
          originalFilename &&
          originalFilePath &&
          fs.existsSync(originalFilePath)
        ) {
          try {
            fs.unlinkSync(originalFilePath)
            console.log(
              `🧹 Deleted uploaded file because record not found: ${originalFilename}`
            )
          } catch (unlinkError) {
            console.warn("⚠️ Failed to delete uploaded file:", unlinkError)
          }
        }
        res.status(404).json({ message: "Not found" })
        return
      }

      // If a new image is uploaded
      if (req.file) {
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
        if (existing.image) {
          const oldFilePath = path.join(uploadDir, existing.image)
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath)
              console.log(`🧹 Deleted old image: ${existing.image}`)
            }
          } catch (error) {
            console.warn("⚠️ Failed to delete old image:", error)
          }
        }
      } else if (req.body.image === null) {
        // Case where client explicitly sends image: null to remove existing image
        if (existing.image) {
          const oldFilePath = path.join(uploadDir, existing.image)
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath)
              console.log(
                `🧹 Deleted old image as requested: ${existing.image}`
              )
            } catch (error) {
              console.warn("⚠️ Failed to delete old image as requested:", error)
            }
          }
        }
        finalImageFilename = null // Set image to null in DB
      } else {
        // If no new image is uploaded, keep the existing one
        finalImageFilename = existing.image
      }

      const updated = await prisma.dcbsSubCategory.update({
        where: { id },
        data: {
          decoByStylesId: dcbsId ? Number(dcbsId) : existing.decoByStylesId,
          subCategoryId: sub_dcbs ? Number(sub_dcbs) : existing.subCategoryId,
          image: finalImageFilename || "", // Use the resized filename or existing one
        },
      })

      res.json(updated)
    } catch (err) {
      console.error("❌ Error updating sub-decobystyles:", err)
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
      res.status(500).json({ message: "Server error" })
    }
  }
)

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", "/subdcbs/:id")
    const id = Number(req.params.id)

    try {
      const record = await prisma.dcbsSubCategory.findUnique({ where: { id } })

      if (!record) {
        res.status(404).json({ message: "Not found" })
        return
      }

      await prisma.dcbsSubCategory.delete({ where: { id } })

      // Delete image file if it exists
      if (record.image) {
        const filePath = path.join(uploadDir, record.image)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
            console.log(`🧹 Deleted image: ${record.image}`)
          } catch (err) {
            console.warn("⚠️ Failed to delete image:", err)
          }
        }
      }

      res.json({ message: "Deleted successfully" })
    } catch (err) {
      console.error("❌ Error deleting sub-decobystyles:", err)
      res.status(500).json({ message: "Server error" })
    }
  }
)

export default router
