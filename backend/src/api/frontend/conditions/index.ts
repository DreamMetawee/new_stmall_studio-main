import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายเงื่อนไข
router.get(
  "/:id?",
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/condition-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params

      let conditions

      if (id) {
        const condition = await prisma.policy.findUnique({
          select: {
            id: true,
            condition_content: true,
            condition_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!condition) {
          res.status(404).json({ message: "ไม่พบนโยบายเงื่อนไข" })
          return
        }

        conditions = [condition]
      } else {
        conditions = await prisma.policy.findMany({
          select: {
            id: true,
            condition_content: true,
            condition_title: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(conditions)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)
export default router
