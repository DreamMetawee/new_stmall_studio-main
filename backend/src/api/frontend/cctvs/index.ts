import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายกล้องวงจรปิด (CCTV)
router.get(
  "/",
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/cctv-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params
      let policies

      if (id) {
        const policy = await prisma.policy.findUnique({
          select: {
            id: true,
            cctv_title: true,
            cctv_content: true,
            type: true,
            created: true,
            updated: true,
          },
          where: { id: 10 },
        })

        if (!policy) {
          res.status(404).json({ message: "ไม่พบนโยบายกล้องวงจรปิด" })
          return
        }

        policies = [policy]
      } else {
        policies = await prisma.policy.findMany({
          select: {
            id: true,
            cctv_title: true,
            cctv_content: true,
            type: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(policies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)

export default router
