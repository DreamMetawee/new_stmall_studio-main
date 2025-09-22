import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
  try {
    const data = await prisma.howto_order.findMany({
      orderBy: { order_step: "asc" },
      select: {
        id: true,
        order_step: true,
        name: true,
        sub_name: true,
        image: true,
      },
    })

    res.json(data).status(200)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
