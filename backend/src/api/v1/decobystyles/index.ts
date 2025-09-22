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
import { slugify } from "../../../utils/string"
import sharp from "sharp" // Import sharp library
import {
  IMG_MAX_WIDTH,
  IMG_MAX_HEIGHT,
  IMG_QUALITY,
} from "./../../../libs/config" // Import image constants
import logging from "../../../utils/logging" // Ensure logging is imported

const router = Router()
const { uploader: upload, uploadDir } = createUploader("decobystyles")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/decobystyles") // Add logging
    try {
      const data =
        (await prisma.decoByStyles.findMany({
          select: {
            id: true,
            image: true,
            name: true,
            _count: {
              select: { dcbsSubCategory: true },
            },
          },
        })) || []

      const formatedData = data.map(i => ({
        id: i.id,
        image: i.image,
        name: i.name,
        item_count: i._count.dcbsSubCategory,
      }))

      res.json(formatedData)
    } catch (err) {
      console.error("❌ Error fetching decobystyles:", err) // Add error logging
      res.status(500).json({ message: "Server error" }) // Send error response
    }
  }
)

router.get(
  "/:dcbsId",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/decobystyles/${req.params.dcbsId}`) // Add logging
    try {
      const dcbsId = Number(req.params.dcbsId)
      if (isNaN(dcbsId)) {
        res.status(400).json({ message: "Invalid ID" })
        return
      }

      const data = await prisma.decoByStyles.findFirst({
        where: { id: dcbsId },
        select: {
          id: true,
          image: true,
          name: true,
          dcbsSubCategory: {
            select: {
              id: true,
              image: true,
              subCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
      })

      if (!data) {
        res.status(404).json({ message: "Not found" })
        return
      }

      const formattedData = {
        id: data.id,
        image: data.image,
        name: data.name,
        lists: data.dcbsSubCategory.map(item => ({
          id: item.id,
          image: item.image,
          name: item.subCategory?.name,
        })),
      }

      res.json(formattedData)
    } catch (err) {
      console.error("❌ Error fetching decobystyles by ID:", err) // Add error logging
      res.status(500).json({ message: "Server error" }) // Send error response
    }
  }
)

router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    logging("POST", "v1", "/decobystyles") // Add logging
    const { name } = req.body
    const originalFilename = req.file?.filename || "" // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename)
      : ""
    let finalImageFilename = "" // Final filename to be saved in DB

    if (!name) {
      // Cleanup uploaded file if name is missing
      if (originalFilename && fs.existsSync(originalFilePath)) {
        try {
          fs.unlinkSync(originalFilePath)
          console.log(
            `🧹 Deleted original uploaded file due to missing name: ${originalFilename}`
          )
        } catch (unlinkError) {
          console.warn(
            "⚠️ Failed to delete original uploaded file:",
            unlinkError
          )
        }
      }
      res.status(400).json({ message: "Name is required" })
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

      const slugname = slugify(name)
      const result = await prisma.decoByStyles.create({
        data: {
          name,
          slugname,
          image: finalImageFilename || "", // Use the resized filename or null if no image
        },
      })

      res.status(201).json(result)
    } catch (err) {
      console.error("❌ Error creating decobystyles:", err)

      // Cleanup uploaded file if DB insert fails
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

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("image"),
  async (req: Request, res: Response) => {
    logging("PATCH", "v1", `/decobystyles/${req.params.id}`) // Add logging
    const id = Number(req.params.id)
    const { name } = req.body
    const originalFilename = req.file?.filename // Original filename from Multer
    const originalFilePath = req.file
      ? path.join(uploadDir, originalFilename!)
      : undefined
    let finalImageFilename: string | null | undefined = undefined // Final filename to be saved in DB

    try {
      // 1. Fetch current data
      const existing = await prisma.decoByStyles.findUnique({ where: { id } })

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

      // 2. Update record
      const slugname = slugify(name || existing.name) // Use existing name if new name is not provided
      const updated = await prisma.decoByStyles.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          slugname,
          image: finalImageFilename || "", // Use the resized filename or existing one
        },
      })

      res.json(updated)
    } catch (err) {
      console.error("❌ Error updating decobystyles:", err)

      // Rollback new image if something fails
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

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", `/decobystyles/${req.params.id}`) // Add logging
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID" })
        return
      }

      // Step 1: Get the main record and subcategories
      const record = await prisma.decoByStyles.findUnique({
        where: { id },
        include: {
          dcbsSubCategory: true, // include subcategories to get their images
        },
      })

      if (!record) {
        res.status(404).json({ message: "Not found" })
        return
      }

      // Step 2: Delete subcategory images
      for (const sub of record.dcbsSubCategory) {
        if (sub.image) {
          const subImagePath = path.join(uploadDir, sub.image)
          if (fs.existsSync(subImagePath)) {
            try {
              fs.unlinkSync(subImagePath) // Use Sync for simplicity in loop, or await Promise.all for async
              console.log(`🧹 Deleted subcategory image: ${sub.image}`)
            } catch (err) {
              console.warn("⚠️ Failed to delete subcategory image:", err)
            }
          }
        }
      }

      // Step 3: Delete subcategories from DB
      await prisma.dcbsSubCategory.deleteMany({
        where: { decoByStylesId: id },
      })

      // Step 4: Delete main record
      await prisma.decoByStyles.delete({ where: { id } })

      // Step 5: Delete main image
      if (record.image) {
        const imagePath = path.join(uploadDir, record.image)
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath) // Use Sync for simplicity, or await Promise.all for async
            console.log(`🧹 Deleted main image: ${record.image}`)
          } catch (err) {
            console.warn("⚠️ Failed to delete main image:", err)
          }
        }
      }

      res.json({ success: true, message: "ลบข้อมูลสำเร็จ" })
    } catch (err) {
      console.error("❌ Error deleting decobystyles:", err)
      res.status(500).json({ message: "Server error" })
    }
  }
)

export default router
