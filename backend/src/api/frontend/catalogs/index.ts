import { Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (_, res) => {
  logging("GET", "frontend", "/catalogs")
  try {
    const data = await prisma.catalog.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
        catalog_img: true,
        catalog_link: true,
        category_id: true,
        status: true,
        catelogImages: {
          select: {
            id: true,
            image: true,
          },
        },
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

export default router
