import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import path from "path"
import fs from "fs"
import logging from "../../../utils/logging"

const router = Router()

const uploadDir = path.join(__dirname, "../../../public/users")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (_: Request, res: Response) => {
    logging("GET", "v1", `/inpayment`)

    try {
      const payments = await prisma.payment.findMany({
        select: {
          id: true,
          order_number: true,
          custname: true,
          email: true,
          telephone: true,
          amount: true,
          payment_img: true,
          payment_date: true,
          payment_time: true,
          status: true,
          remark: true,
        },
        where: { status: true },
      })

      const formatPaymemts = payments.map(payment => {
        const date = new Date(payment.payment_date)
        const time = new Date(payment.payment_time)

        return {
          id: payment.id,
          payment_id: payment.order_number,
          customer_name: payment.custname,
          email: payment.email,
          phone: payment.telephone,
          amount: payment.amount,
          slip_image: payment.payment_img,
          payment_date: date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          payment_time: time.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          status: payment.status,
          details: payment.remark,
        }
      })

      res.json(formatPaymemts)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json([])
    }
  }
)

export default router
