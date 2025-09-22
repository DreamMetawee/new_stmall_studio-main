import "dotenv/config"
import { Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"
const PORT: number =
  process.env.NODE_ENV === "production" ? Number(process.env.PORT) : 3005
const HOST =
  process.env.NODE_ENV === "production"
    ? "http://api.stmallstudio.com/api/"
    : `http://localhost:${PORT}/api/`

const router = Router()

const routing = {
  full_categories: `${HOST}/categories/full-categories`,
  main_category: `${HOST}/categories/main-category`,
  sub_category: `${HOST}/categories/sub-category`,
  product_type: `${HOST}/categories/product-type`,
}

router.get("/", (req, res) => {
  logging("GET", "frontend", "/")
  res.json({ status: "ready", routing })
})

router.get("/full-categories", async (_, res) => {
  logging("GET", "frontend", routing.full_categories)
  try {
    const data = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
        icon: true,
        categorysub: {
          select: {
            id: true,
            name: true,
            slugname: true,
            types: {
              select: {
                id: true,
                name: true,
                slugname: true,
              },
            },
          },
        },
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

router.get("/main-category", async (_, res) => {
  logging("GET", "frontend", routing.main_category)
  try {
    const data = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
        icon: true,
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

router.get("/sub-category", async (_, res) => {
  logging("GET", "frontend", routing.sub_category)
  try {
    const data = await prisma.categorysub.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

router.get("/product-type", async (_, res) => {
  logging("GET", "frontend", routing.product_type)
  try {
    const data = await prisma.type.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
      },
    })

    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

export default router
