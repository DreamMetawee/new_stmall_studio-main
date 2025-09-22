import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายการจัดส่งทั้งหมดหรือแบบระบุ ID
router.get(
  "/:id?",
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/delivery-terms/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let deliveryPolicies

      if (id) {
        const deliveryPolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            delivery_term_title: true,
            delivery_term_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!deliveryPolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายการจัดส่ง" })
        }

        deliveryPolicies = [deliveryPolicy]
      } else {
        deliveryPolicies = await prisma.policy.findMany({
          select: {
            id: true,
            delivery_term_title: true,
            delivery_term_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: {
            type: "DELIVERY",
          },
        })
      }

      res.status(200).json(deliveryPolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

export default router