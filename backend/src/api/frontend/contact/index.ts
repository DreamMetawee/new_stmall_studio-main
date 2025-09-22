import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"

const router = Router()

// Constants
const CONTACT_PAGE_ID = 1

router.get("/", async (req: Request, res: Response) => {
  logging("GET", "v1", `/about-us`)

  try {
    const contact = await prisma.about_us.findUnique({
      where: { id: CONTACT_PAGE_ID },
      select: {
        contact_image: true,
        contact_name: true,
        sub_contact_name: true,
        contact_description: true,
        contact_position: true,
        contact_mobile: true,
        contact_phone: true,
        contact_email: true,
        contact_hour: true,
        contact_line: true,
        contact_facebook: true,
        contact_website: true,
        contact_google_map: true,
      },
    })

    if (!contact) {
      res.status(404).json({ message: "Contact content not found" })
      return
    }

    // Structure the response data
    const response = {
      data: {
        contact_image: contact.contact_image,
        contact_name: contact.contact_name,
        sub_contact_name: contact.sub_contact_name,
        contact_description: contact.contact_description,
        contact_position: contact.contact_position,
        contact_mobile: contact.contact_mobile,
        contact_phone: contact.contact_phone,
        contact_email: contact.contact_email,
        contact_hour: contact.contact_hour,
        contact_line: contact.contact_line,
        contact_facebook: contact.contact_facebook,
        contact_website: contact.contact_website,
        contact_google_map: contact.contact_google_map,
      },
      message: "Contact data retrieved successfully",
    }

    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve contact data",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
})

export default router
