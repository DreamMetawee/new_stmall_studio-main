import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserProps } from "../../../types"
import {
  ALLOWED_ROLES,
  authMiddleware,
  AuthRequest,
  permissionMiddleware,
} from "../../../middleware"
import path from "path"
import fs from "fs"
import RESP_MSG from "../../../constants"
import { createUploader } from "../../../utils/upload"
import logging from "../../../utils/logging"

const router = Router()
const { uploader: upload, uploadDir } = createUploader("users")

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    logging("GET", "v1", `/users`)

    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          name: true,
          nickname: true,
          jobposi: true,
          usercode: true,
          telephone: true,
          userpic: true,
          status: true,
        },
      })

      const formatUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        nickname: u.nickname,
        permission: u.jobposi,
        username: u.usercode,
        phone: u.telephone,
        avatar: u.userpic,
        status: u.status,
      }))

      res.json(formatUsers)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({
        counts: 0,
        users: [],
      })
    }
  }
)

router.get(
  "/v/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const { id } = req.params
    logging("GET", "v1", `/users/v/${id}`)

    try {
      const user = await prisma.users.findUnique({
        select: {
          id: true,
          name: true,
          nickname: true,
          jobposi: true,
          usercode: true,
          telephone: true,
          userpic: true,
          status: true,
        },
        where: { id: Number(id) },
      })

      const formatUsers = {
        id: user?.id,
        name: user?.name,
        nickname: user?.nickname,
        permission: user?.jobposi,
        username: user?.usercode,
        phone: user?.telephone,
        avatar: user?.userpic,
        status: user?.status,
      }

      res.json({ success: true, user: formatUsers })
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({ success: false, user: null })
    }
  }
)

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const user = await prisma.users.findUnique({
      where: { usercode: username },
    })

    if (!user || !user.status) {
      res.status(401).json({
        success: false,
        message: "ชื่อผู้ใช้ไม่ถูกต้องหรือถูกปิดใช้งาน",
      })
      return
    }

    const isMatch = await bcrypt.compare(password, String(user.password))

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "รหัสผ่านไม่ถูกต้อง",
      })
      return
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      permission: user.jobposi,
      username: user.usercode,
      phone: user.telephone,
      avatar: user.userpic,
    }

    const secretKey = process.env.SECRET_KEY as string
    const refreshSecretKey = process.env.REFRESH_SECRET_KEY as string // ใช้ key แยกจะปลอดภัยกว่า

    const accessToken = jwt.sign(userPayload, secretKey, { expiresIn: "3h" }) // access token อายุสั้น
    const refreshToken = jwt.sign(userPayload, refreshSecretKey, {
      expiresIn: "7d",
    }) // refresh token อายุยาว

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token: accessToken,
      refreshToken, // ⬅️ สำคัญมาก
      user: userPayload,
    })
  } catch (error) {
    console.error("❌ login error:", error)
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    })
  }
})

router.post("/refresh-token", async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  logging("POST", "v1", `/users/refresh-token`)

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: "ไม่มี refresh token",
    })
    return
  }

  try {
    const refreshSecretKey = process.env.REFRESH_SECRET_KEY as string
    const decoded = jwt.verify(refreshToken, refreshSecretKey) as UserProps

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        nickname: true,
        jobposi: true,
        usercode: true,
        telephone: true,
        userpic: true,
        status: true,
      },
    })

    if (!user || !user.status) {
      res
        .status(403)
        .json({ success: false, message: "ผู้ใช้ไม่ถูกต้องหรือถูกปิดใช้งาน" })
      return
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        permission: user.jobposi,
        username: user.usercode,
        phone: user.telephone,
        avatar: user.userpic,
      },
      refreshSecretKey,
      { expiresIn: "3h" }
    )

    res.json({ success: true, token: newToken })
  } catch (error) {
    console.error("❌ refresh token error:", error)
    res
      .status(403)
      .json({ success: false, message: "refresh token ไม่ถูกต้อง" })
  }
})

router.get(
  "/authen",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1]
    const SECRET_KET = process.env.SECRET_KEY as string
    logging("GET", "v1", `/users/authen`)

    if (!token) {
      res.json({ success: false, message: RESP_MSG.MISSION_TOKEN })
      return
    }

    try {
      const decoded = jwt.verify(token, SECRET_KET) as UserProps
      res.json({ success: true, user: decoded })
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({ success: false, message: RESP_MSG.MISSION_TOKEN })
    }
  }
)

//? Route สำหรับสร้างผู้ใช้งานใหม่
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: AuthRequest, res: Response) => {
    const { name, nickname, username, phone, permission } = req.body
    logging("POST", "v1", `/users/create`)

    // Validation
    if (!name || !nickname || !username || !phone || !permission) {
      res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      })
      return
    }

    try {
      const updateUser = req.user?.username

      // ตรวจสอบว่ามี usercode ซ้ำหรือไม่
      const existingUser = await prisma.users.findUnique({
        where: {
          usercode: username,
        },
      })

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "มีรหัสพนักงานนี้ในระบบแล้ว",
        })
        return
      }

      const hashPassword = await bcrypt.hash("1234", 12)

      // เพิ่มผู้ใช้งานใหม่
      await prisma.users.create({
        data: {
          name,
          nickname,
          usercode: username,
          telephone: phone,
          jobposi: permission, // "member" หรือ "admin"
          password: hashPassword, // จะใช้ระบบ reset password หรือใส่ default ทีหลังก็ได้
          createur: updateUser || "system", // จาก token
          updateur: updateUser || "system",
        },
      })

      res.status(201).json({
        success: true,
        message: "สร้างผู้ใช้งานสำเร็จ",
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน",
      })
    }
  }
)

//? Route สำหรับอัปเดตข้อมูลผู้ใช้งาน
router.post(
  "/update/info/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, nickname, username, phone, permission, status } = req.body
    logging("POST", "v1", `/users/info/${id}`)

    if (!id || !name || !nickname || !username || !phone) {
      res.status(400).json({ success: false, message: RESP_MSG.MISSION_VALUE })
      return
    }

    try {
      const updateUser = req.user?.username
      const requesterId = req.user?.id
      const requesterRole = req.user?.permission

      if (!updateUser) {
        res
          .status(403)
          .json({ success: false, message: RESP_MSG.AUTHEN_FAILED })
        return
      }

      // 🛡️ ตรวจสอบสิทธิ์: ถ้าไม่ใช่ admin และ id ที่จะอัปเดตไม่ตรงกับตัวเอง
      if (requesterRole !== "admin" && Number(id) !== requesterId) {
        res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์ในการอัปเดตข้อมูลของผู้อื่น",
        })
        return
      }

      const payload =
        requesterRole === "admin"
          ? {
              name,
              nickname,
              usercode: username,
              jobposi: permission,
              telephone: phone,
              status,
            }
          : {
              name,
              nickname,
              usercode: username,
              telephone: phone,
            }

      const updateResults = await prisma.users.update({
        data: payload,
        where: { id: Number(id) },
      })

      if (updateResults) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_UPDATE })
      } else {
        throw new Error(RESP_MSG.FAILED_UPDATE)
      }
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({
        success: false,
        message: error.message ?? RESP_MSG.ERROR,
      })
    }
  }
)

router.post(
  "/change-password/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL), // หรือจำกัดเฉพาะที่จำเป็น
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { oldPassword, newPassword } = req.body
    logging("POST", "v1", `/users/change-password/${id}`)

    const currentUser = req.user // สมมุติว่ามาจาก authMiddleware

    if ((currentUser?.permission !== "admin" && !oldPassword) || !newPassword) {
      res
        .status(400)
        .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
      return
    }

    const userToUpdate = await prisma.users.findUnique({
      where: { id: Number(id) },
    })
    if (!userToUpdate) {
      res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" })
      return
    }

    // 🔐 ตรวจสอบสิทธิ์ว่า user คนนั้นเปลี่ยนของตัวเอง หรือเป็นแอดมิน
    const isSelf = currentUser?.id === Number(id)
    const isAdmin = currentUser?.permission === "admin" // แล้วแต่ระบบคุณมี role อะไรบ้าง

    if (!isSelf && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้งานนี้",
      })
      return
    }

    // ถ้าไม่ใช่แอดมิน ให้ตรวจสอบรหัสผ่านเก่า
    if (!isAdmin) {
      const isMatch = await bcrypt.compare(
        oldPassword,
        String(userToUpdate?.password)
      )
      if (!isMatch) {
        res
          .status(401)
          .json({ success: false, message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" })
        return
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.users.update({
      where: { id: Number(id) },
      data: { password: hashedPassword },
    })

    res.json({ success: true, message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" })
  }
)

router.post(
  "/:id/upload-avatar",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  upload.single("avatar"),
  async (req: Request, res: Response) => {
    const userId = req.params.id
    const newImage = req.file?.filename
    logging("POST", "v1", `/users/${userId}/upload-avatar`)

    if (!newImage) {
      res.status(400).json({ success: false, message: "No file uploaded." })
      return
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
      })

      // ✅ ใช้ path ที่ถูกต้องจาก uploadDir
      if (user?.userpic) {
        const oldImageFile = user.userpic
        const oldFilePath = path.join(uploadDir, oldImageFile)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      await prisma.users.update({
        where: { id: Number(userId) },
        data: { userpic: newImage },
      })

      res.json({ success: true, image_file: newImage })
    } catch (error) {
      console.error("Upload error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  }
)

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ADMIN),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    logging("DELETE", "v1", `/users/${id}`)

    if (!id) {
      res.json({ success: false, message: RESP_MSG.MISSION_VALUE })
      return
    }

    try {
      const currentUser = req.user
      if (currentUser?.id === Number(id)) {
        res
          .status(400)
          .json({ success: false, message: "ไม่สามารถลบบัญชีตัวเองได้" })
        return
      }

      const results = await prisma.users.delete({ where: { id: Number(id) } })

      if (results) {
        res.json({ success: true, message: RESP_MSG.SUCCESS_DELETE })
      } else {
        throw new Error(RESP_MSG.FAILED_DELETE)
      }
    } catch (error: any) {
      console.error("❌ เกิดข้อผิดพลาด:", error)
      res.json({ success: false, message: error.message ?? RESP_MSG.ERROR })
    }
  }
)

export default router
