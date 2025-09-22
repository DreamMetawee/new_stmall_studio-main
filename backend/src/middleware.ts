import "dotenv/config"
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserProps } from "./types"

export interface AuthRequest extends Request {
  user?: UserProps
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1]

  if (!token) {
    res.status(401).json({ message: "ปฏิเสธการเข้าถึง" })
    return
  }
  try {
    const secretKey = process.env.SECRET_KEY as string
    const decoded = jwt.verify(token, secretKey) as UserProps

    req.user = decoded
    next()
  } catch (err) {
    console.log(err)
    res.status(403).json({ message: "ยืนยันตัวตนล้มเหลว" })
  }
}

export enum Role {
  MEMBER = "member",
  ADMIN = "admin",
}

export const ALLOWED_ROLES = {
  MEMBER: [Role.MEMBER],
  ADMIN: [Role.ADMIN],
  ALL: [Role.ADMIN, Role.MEMBER],
  NOT_ALLOW: [],
}

export const permissionMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.permission)) {
      res.json({ success: false, message: "สิทธิ์การเข้าถึงไม่เพียงพอ" })
    } else {
      next()
    }
  }
}
