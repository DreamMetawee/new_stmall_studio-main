import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายความเป็นส่วนตัว
router.get(
  "/:id?",
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/privacy-policy/${req.params.id ?? ""}`)

    try {
      const { id } = req.params

      let privacyPolicies

      if (id) {
        const privacyPolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            privacy_content: true,
            privacy_title: true,
            created: true,
            updated: true,
          },
          where: { id: Number(id) },
        })

        if (!privacyPolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายความเป็นส่วนตัว" })
          return
        }

        privacyPolicies = [privacyPolicy]
      } else {
        privacyPolicies = await prisma.policy.findMany({
          select: {
            id: true,
            privacy_content: true,
            privacy_title: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(privacyPolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)
export default router
