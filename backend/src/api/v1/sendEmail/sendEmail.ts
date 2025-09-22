import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import { createUploader } from "../../../utils/upload"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"
import logging from "../../../utils/logging"
dotenv.config()

// ตั้งค่า transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const router = Router()
const { uploader: upload, uploadDir } = createUploader("sendEmail")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", "/sendEmail")

    try {
      const sendEmail = await prisma.contact_sales.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          createur: true,
          updateur: true,
          created: true,
          updated: true,
        },
      })

      res.json(sendEmail)
    } catch (error) {}
  }
)

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params // ดึงค่า id จาก URL params
    logging("GET", "v1", `/sendEmail/${id}`)

    try {
      const sendEmail = await prisma.contact_sales.findUnique({
        where: {
          id: Number(id), // ค้นหาข้อมูลจาก id (แปลงเป็นตัวเลข)
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          createur: true,
          updateur: true,
          created: true,
          updated: true,
        },
      })

      if (sendEmail) {
        res.json(sendEmail) // ถ้าพบข้อมูล ส่งข้อมูลกลับ
      } else {
        res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการ" }) // ถ้าไม่พบข้อมูล
      }
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด" }) // กรณีที่เกิดข้อผิดพลาด
    }
  }
)

router.post(
  "/emailEditor",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { to, subject, html, id } = req.body
    logging("POST", "v1", `/sendEmail/emailEditor`)

    // ตรวจสอบว่ามี field ที่จำเป็นหรือไม่
    if (!to || !subject || !html || !id) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    try {
      const mailOptions = {
        from: {
          name: "Stmall",
          address: process.env.EMAIL_USER || "default@example.com",
        },
        to,
        subject,
        text: subject,
        html,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log("✅ Email sent:", info.response)

      await prisma.contact_sales.update({
        where: { id: Number(id) },
        data: {
          updateur: "System",
        },
      })

      res.status(200).json({ message: "Email sent successfully" })
    } catch (error) {
      console.error("❌ Error sending email:", error)
      res.status(500).json({
        error: "Failed to send email",
        message: (error as Error).message || "Unknown error",
      })
    }
  }
)

router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params // ดึงค่า id จาก URL params
    logging("DELETE", "v1", `/sendEmail/delete/${id}`)

    try {
      const deletedRecord = await prisma.contact_sales.delete({
        where: {
          id: Number(id), // ค้นหาข้อมูลจาก id (แปลงเป็นตัวเลข)
        },
      })

      res.status(200).json({
        success: true,
        message: "Record deleted successfully",
        deletedRecord,
      })
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete record",
        error: (error as Error).message,
      })
    }
  }
)

export default router
