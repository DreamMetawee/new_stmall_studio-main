import { Request, Response, Router } from "express"
import prisma from "../../../libs/prisma"
import {
  ALLOWED_ROLES,
  authMiddleware,
  permissionMiddleware,
} from "../../../middleware"

const router = Router()

router.get(
  "/metrics",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const totalProducts = await prisma.products.count()
      const totalBrands = await prisma.brand.count()
      const totalVisitors = await prisma.productVisitors.count()

      res.json({
        products: totalProducts,
        brands: totalBrands,
        visitors: totalVisitors,
        trends: {
          visitors: 11.01,
          products: -9.05,
          brands: 11.01,
        },
      })
    } catch (error) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/metrics/visitors-monthly",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear()
      const yearsToFetch = 5 // จำนวนปีย้อนหลังที่ต้องการดึง

      const monthlyData = (
        data: { month: number; count: number | bigint }[]
      ) => {
        const result = Array(12).fill(0)
        data.forEach(({ month, count }) => {
          result[month - 1] = Number(count) // แปลง bigint เป็น number
        })
        return result
      }

      const convertBigInt = (data: { month: number; count: bigint }[]) =>
        data.map(d => ({ month: d.month, count: Number(d.count) }))

      // สร้าง array ปี เช่น [2025, 2024, 2023, 2022, 2021]
      const years = Array.from(
        { length: yearsToFetch },
        (_, i) => currentYear - i
      )

      // ดึงข้อมูลของแต่ละปีพร้อมกัน
      const queries = years.map(year =>
        prisma.$queryRawUnsafe<{ month: number; count: bigint }[]>(`
          SELECT MONTH(created) as month, COUNT(*) as count
          FROM productVisitors
          WHERE YEAR(created) = ${year}
          GROUP BY month
        `)
      )

      const results = await Promise.all(queries)

      // รวมข้อมูลเป็น object { year: [counts for 12 months] }
      const data = years.reduce((acc, year, idx) => {
        acc[year] = monthlyData(convertBigInt(results[idx]))
        return acc
      }, {} as Record<number, number[]>)

      res.json({
        currentYear,
        years,
        data,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/metrics/top-products",
  authMiddleware,
  permissionMiddleware(ALLOWED_ROLES.ALL),
  async (req: Request, res: Response) => {
    try {
      const topProducts = await prisma.products.findMany({
        take: 10,
        orderBy: {
          visitors: {
            _count: "desc",
          },
        },
        include: {
          visitors: true,
          type: {
            include: {
              categorysub: {
                include: {
                  category: true,
                },
              },
            },
          },
          brand: true,
        },
      })

      const formatted = topProducts.map(product => {
        const categoryChain = [
          product.type.categorysub.category.name, // หมวดหมู่หลัก
          product.type.categorysub.name, // หมวดหมู่ย่อย
          product.type.name, // ประเภท
        ]

        return {
          id: product.id,
          name: product.name,
          image: product.image_url || "/images/default.jpg",
          categories: categoryChain,
          price: `${product.price.toFixed(2)} ${product.currency || "บาท"}`,
          promotion_price: `${(product.regular_price || 0).toFixed(2)} ${
            product.currency || "บาท"
          }`,
          views: product.visitors.length,
        }
      })

      res.json(formatted)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
