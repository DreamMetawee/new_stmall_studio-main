import { Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (_, res) => {
  logging("GET", "frontend", "/brands")
  try {
    const data = await prisma.brand.findMany({
      select: {
        id: true,
        slugname: true,
        name: true,
        logo_url: true,
        brand_description: true,
        website_link: true,
        status: true,
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

export default router
