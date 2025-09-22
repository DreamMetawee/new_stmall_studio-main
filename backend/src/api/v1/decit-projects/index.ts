import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import { createUploader } from "../../../utils/upload"
import logging from "../../../utils/logging"
import { deleteFile } from "../../../utils/file"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("projects")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (_: Request, res: Response) => {
    logging("GET", "v1", "/decit-projects")

    try {
      const data = await prisma.projects.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
        },
      })
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/:projectId",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/decit-projects/:projectId")

    try {
      const id = Number(req.params.projectId)

      const data = await prisma.projects.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
        },
      })
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.post(
  "/",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("POST", "v1", "/decit-projects")
    const image = req.file ? req.file.filename : null

    try {
      const updateUser = req.user?.username

      const { name, description } = req.body
      const newProject = await prisma.projects.create({
        data: {
          name,
          description,
          image,
          createur: updateUser,
        },
      })
      res.status(201).json(newProject)
    } catch (error) {
      if (image) deleteFile(uploadDir, image)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.patch(
  "/:projectId",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    logging("PATCH", "v1", "/decit-projects/:projectId")

    try {
      const id = Number(req.params.projectId)
      const updateUser = req.user?.username
      const image = req.file ? req.file.filename : null

      const { name, description } = req.body

      const existingProject = await prisma.projects.findUnique({
        where: { id },
      })

      if (!existingProject) {
        res.status(404).json({ error: "Project not found" })
        return
      }

      if (image && existingProject.image) {
        deleteFile(uploadDir, existingProject.image)
      }

      const updatedProject = await prisma.projects.update({
        where: { id },
        data: {
          name,
          description,
          image: image ?? existingProject.image,
          createur: updateUser,
        },
      })

      res.status(200).json(updatedProject)
    } catch (error) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete(
  "/:projectId",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("DELETE", "v1", "/decit-projects/:projectId")

    try {
      const id = Number(req.params.projectId)
      const existingProject = await prisma.projects.findUnique({
        where: { id },
      })

      if (!existingProject) {
        res.status(404).json({ error: "Project not found" })
        return
      }

      if (existingProject.image) {
        deleteFile(uploadDir, existingProject.image)
      }

      const deletedProject = await prisma.projects.delete({ where: { id } })
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
