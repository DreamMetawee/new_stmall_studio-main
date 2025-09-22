import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
  try {
    logging("GET", "v1", "/employees")

    const employees = await prisma.team_members.findMany({
      select: {
        id: true,
        name: true,
        position: true,
        description: true,
        image_path: true,
      },
    })

    res.status(200).json(employees)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err })
  }
})

export default router
