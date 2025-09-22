import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
  logging("GET", "frontend", "/")

  try {
    const data = await prisma.decoByStyles.findMany({
      select: {
        id: true,
        name: true,
        slugname: true,
        image: true,
      },
    })
    res.json(data)
  } catch (err) {
    console.log(err)
  }
})

router.get("/:dcbsName", async (req: Request, res: Response) => {
  const { dcbsName } = req.params
  logging("GET", "frontend", `/${dcbsName}`)

  try {
    const data = await prisma.dcbsSubCategory.findMany({
      where: {
        decoByStyles: {
          slugname: dcbsName,
        },
      },
      select: {
        id: true,
        image: true,
        subCategory: {
          select: {
            id: true,
            name: true,
            slugname: true,
          },
        },
      },
    })

    const formattedData = data.map(i => ({
      image: i.image,
      name: i.subCategory.name,
      slugname: i.subCategory.slugname,
    }))

    res.json(formattedData)
  } catch (err) {
    console.log(err)
  }
})

export default router
