import { Request, Response, Router } from "express"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import prisma from "../../../libs/prisma"
import logging from "../../../utils/logging"

const router = Router()

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const data = await prisma.faq.findMany({
        select: {
          id: true,
          question: true,
          answer: true,
        },
      })

      const formattedData = data.map(item => ({
        id: item.id,
        name: item.question,
        answer: item.answer,
      }))

      res.json(formattedData).status(200)
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
    try {
      const { id } = req.params

      const data = await prisma.faq.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          question: true,
          answer: true,
        },
      })

      if (!data) {
        res.status(404).json({ message: "FAQ not found" })
        return
      }

      const formattedData = {
        id: data.id,
        name: data.question,
        answer: data.answer,
      }

      res.status(200).json(formattedData)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

router.post(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const { question, answer } = req.body

      console.log(question, answer)

      const data = await prisma.faq.create({
        data: {
          question,
          answer,
        },
      })

      res.status(201).json(data)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { question, answer } = req.body

    try {
      logging("PATCH", "v1", `faqs/${id}`)

      const data = await prisma.faq.update({
        where: { id: Number(id) },
        data: {
          question,
          answer,
        },
      })

      res.status(200).json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const data = await prisma.faq.delete({
        where: { id: Number(id) },
      })

      res.status(200).json(data)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

export default router
