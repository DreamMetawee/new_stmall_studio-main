import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

const formatItem = (item: any) => ({
  id: item.id,
  name: item.name,
  slugname: item.slugname,
  description: item.description,
  image: item.image_path,
})

router.get("/", async (req: Request, res: Response) => {
  logging("GET", "v1", `/decit`)

  try {
    const decitProjects = await prisma.projects.findMany({
      select: {
        name: true,
        description: true,
        image: true,
      },
    })

    const categories = await prisma.service_categories.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
        description: true,
        image_path: true,
      },
    })

    const formatted = categories.map(formatItem)
    res.json({ decit: formatted, projects: decitProjects })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
  }
})

router.get("/:decitName", async (req: Request, res: Response) => {
  const { decitName } = req.params
  logging("GET", "v1", `/decit/${decitName}`)

  try {
    const data = await prisma.service_items.findMany({
      where: {
        service_categories: {
          slugname: decitName,
        },
      },
      select: {
        id: true,
        name: true,
        slugname: true,
        description: true,
        image_path: true,
      },
    })

    const formattedData = data.map(i => ({
      id: i.id,
      name: i.name,
      slugname: i.slugname,
      description: i.description,
      image: i.image_path,
    }))

    res.json(formattedData)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
  }
})

export default router
