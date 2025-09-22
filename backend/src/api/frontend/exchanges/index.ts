import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายการแลกเปลี่ยน
router.get(
  "/:id?",
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/exchange-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let exchangePolicies

      if (id) {
        const exchangePolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            exchange_content: true,
            exchange_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!exchangePolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายการแลกเปลี่ยน" })
          return
        }

        exchangePolicies = [exchangePolicy]
      } else {
        exchangePolicies = await prisma.policy.findMany({
          select: {
            id: true,
            exchange_content: true,
            exchange_title: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { type: "exchange" },
        })
      }

      res.status(200).json(exchangePolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

export default router