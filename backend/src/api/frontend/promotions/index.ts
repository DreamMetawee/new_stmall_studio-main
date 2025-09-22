import { Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (_, res) => {
  logging("GET", "frontend", "/promotions")
  try {
    const data = await prisma.sliders.findMany({
      select: {
        id: true,
        title: true,
        image_url: true,
        description: true,
        link: true,
        status: true,
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

export default router
