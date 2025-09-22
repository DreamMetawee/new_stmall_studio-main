import "dotenv/config"
import express from "express"
import type { Application } from "express"
import cors from "cors"
import { rateLimit } from "express-rate-limit"

import rootRoutes from "./api/rootRoutes"
import path from "path"

const limiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 15 minutes
  limit: 1500, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

const isProd = process.env.NODE_ENV === "production"
const origins =
  isProd && process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS : "*"
const allowedOrigins =
  origins === "*"
    ? ["http://localhost:5173", "http://localhost:3000"]
    : origins.split(",").map(origin => origin.trim())

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

const app: Application = express()
const PORT: number = isProd ? Number(process.env.PORT) : 3005
export const HOST = isProd
  ? "http://api.stmallstudio.com/api/"
  : `http://localhost:${PORT}/api/`

// เปิดใช้งาน CORS และ JSON middleware
app.set("trust proxy", 1)
app.use(limiter)
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/public", express.static(path.join(__dirname, "public")))

// Root Router API
app.use("/api", rootRoutes)

// เปิดเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}`)
})
