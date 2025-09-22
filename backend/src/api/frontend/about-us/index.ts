import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
  logging("GET", "v1", `/about-us`)

  try {
    // Execute both queries in parallel to reduce response time
    const [aboutUs, business, employees] = await Promise.all([
      prisma.about_us.findUnique({
        where: { id: 1 },
        select: {
          hero_image: true,
          our_vision: true,
          our_mission: true,
          record_title: true,
          record_subtitle: true,
          record_image_1st: true,
          record_image_2nd: true,
          record_image_3rd: true,
          record_image_4th: true,
          record_image_5th: true,
          record_image_6th: true,
          business_title: true,
          business_content: true,
        },
      }),
      prisma.business_groups.findMany({
        select: {
          id: true,
          name: true,
          logo_path: true,
          website_url: true,
        },
      }),
      prisma.team_members.findMany({
        orderBy: { order_step: "asc" },
        select: {
          name: true,
          position: true,
          description: true,
          image_path: true,
          order_step: true,
        },
      }),
    ])

    if (!aboutUs) {
      res.status(404).json({ message: "About us content not found" })
      return
    }

    // Structure the response more clearly
    const response = {
      hero: {
        image: aboutUs.hero_image,
      },
      vision: aboutUs.our_vision,
      mission: aboutUs.our_mission,
      records: {
        title: aboutUs.record_title,
        subtitle: aboutUs.record_subtitle,
        images: [
          aboutUs.record_image_1st,
          aboutUs.record_image_2nd,
          aboutUs.record_image_3rd,
          aboutUs.record_image_4th,
          aboutUs.record_image_5th,
          aboutUs.record_image_6th,
        ].filter(Boolean), // Remove any null/undefined values
      },
      business: {
        title: aboutUs.business_title,
        content: aboutUs.business_content,
        data: business,
      },
      team: employees,
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      // Only include error details in development
      error: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
})

export default router
