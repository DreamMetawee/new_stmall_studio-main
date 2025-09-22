import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// GET: ดึงนโยบายคุกกี้ทั้งหมด (เมื่อไม่มี id) หรือดึงเฉพาะรายการเดียว (เมื่อมี id)
router.get(
  "/", // เพิ่ม `:id?` เพื่อให้รองรับทั้งกรณีที่มี `id` หรือไม่มี `id`
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/cookie-policy/${req.params.id ? req.params.id : ""}`)

    try {
      const { id } = req.params

      let cookiePolicies // เปลี่ยนชื่อตัวแปรให้เป็นพหูพจน์เพื่อให้สื่อถึงข้อมูลหลายรายการ

      if (id) {
        // หากมี `id` ใน params ให้ดึงข้อมูลรายการเดียว
        const cookiePolicy = await prisma.policy.findUnique({
          select: {
            id: true,
            cookie_content: true,
            cookie_title: true,
            created: true,
            updated: true,
          },
          where: { id: 1 },
        })

        if (!cookiePolicy) {
          res.status(404).json({ message: "ไม่พบนโยบายคุกกี้" })
          return
        }

        cookiePolicies = [cookiePolicy] // ส่งกลับเป็น Array เสมอเพื่อให้ Frontend จัดการได้ง่าย
      } else {
        // ถ้าไม่มี `id` ให้ดึงข้อมูลทั้งหมด
        cookiePolicies = await prisma.policy.findMany({
          select: {
            id: true,
            cookie_content: true,
            cookie_title: true,
            created: true,
            updated: true,
          },
        })
      }

      res.status(200).json(cookiePolicies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error })
    }
  }
)
export default router