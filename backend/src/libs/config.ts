import prisma from "./prisma"

export const IMG_MAX_WIDTH = 1920
export const IMG_MAX_HEIGHT = 1080
export const IMG_QUALITY = 85

export const backupAndRestoreTables = [
  { name: "users", model: prisma.users },
  { name: "main_category", model: prisma.category },
  { name: "sub_category", model: prisma.categorysub },
  { name: "types", model: prisma.type },
  { name: "inpayment", model: prisma.payment },
  { name: "promotions", model: prisma.sliders },
  { name: "brands", model: prisma.brand },
  { name: "products", model: prisma.products },
  { name: "productVisitors", model: prisma.productVisitors },
  { name: "productshero", model: prisma.productshero },
  { name: "catelog", model: prisma.catalog },
  { name: "catalogImage", model: prisma.catalogImage },
  { name: "decoByStyles", model: prisma.decoByStyles },
  { name: "dcbsSubCategory", model: prisma.dcbsSubCategory },
  { name: "about_us", model: prisma.about_us },
  { name: "business_groups", model: prisma.business_groups },
  { name: "team_members", model: prisma.team_members },
  { name: "contact_sales", model: prisma.contact_sales },
  { name: "our_stores", model: prisma.our_stores },
  { name: "service_categories", model: prisma.service_categories },
  { name: "service_items", model: prisma.service_items },
  { name: "policy", model: prisma.policy },
  { name: "howto_order", model: prisma.howto_order },
  { name: "faqs", model: prisma.faq },
]
