import { Request, Response, Router } from "express"
import logging from "../../../utils/logging"
import prisma from "../../../libs/prisma"
import { ProductType } from "@prisma/client"

const router = Router()

// Increase product view count
router.patch("/view/:productId", async (req: Request, res: Response) => {
  logging("PATCH", "frontend", `/view/:productId`)

  try {
    const id = Number(req.params.productId)

    await prisma.productVisitors.create({
      data: {
        product_id: id,
      },
    })

    res.status(200).json({ message: "ok" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update view count" })
  }
})

// --- Helper: parse size string "widthxlengthxheight" ---
function parseProductSize(size: string | null | undefined) {
  if (!size) return { width: null, length: null, height: null }
  const [width, length, height] = String(size).split("x")
  return {
    width: width ? Number(width) : null,
    length: length ? Number(length) : null,
    height: height ? Number(height) : null,
  }
}

// GET /api/products?page=1&limit=20
router.get("/", async (req: Request, res: Response) => {
  logging("GET", "frontend", "/products")

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  try {
    const data = await prisma.products.findMany({
      where: { status: true },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slugname: true,
        unitname: true,
        _count: {
          select: {
            visitors: true,
          },
        },
        type: {
          select: {
            name: true,
            categorysub: {
              select: {
                name: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
        description: true,
        price: true,
        regular_price: true,
        currency: true,
        image_url: true,
        product_link: true,
        product_type: true,
        status: true,
        size: true,
        weight: true,
      },
    })

    const formatedData = data.map(i => {
      const { width, length, height } = parseProductSize(i.size)
      return {
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        unitname: i.unitname,
        category: i.type.categorysub.category.name,
        sub_category: i.type.categorysub.name,
        type: i.type.name,
        description: i.description,
        price: Number(i.price),
        regular_price: Number(i.regular_price),
        currency: i.currency,
        image_url: i.image_url,
        product_link: i.product_link,
        product_type: i.product_type,
        status: i.status,
        review: i._count.visitors,
        weight: i.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formatedData)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Failed to load products" })
  }
})

// GET /api/products/v/:productName
router.get("/v/:productName", async (req: Request, res: Response) => {
  const productName = decodeURIComponent(req.params.productName)
  logging("GET", "frontend", `/products/${productName}`)

  try {
    const data = await prisma.products.findMany({
      where: {
        status: true,
        OR: [
          {
            slugname: {
              contains: productName,
            },
          },
          {
            brand: {
              slugname: {
                contains: productName,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            visitors: true,
          },
        },
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

    const formattedData = data.map(i => {
      const { width, length, height } = parseProductSize(i.size)
      return {
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        unitname: i.unitname,
        category: i.type.categorysub.category.name,
        category_id: i.type.categorysub.category.id,
        sub_category: i.type.categorysub.name,
        sub_category_id: i.type.categorysub.id,
        type: i.type.name,
        type_id: i.type_id,
        description: i.description,
        price: Number(i.price),
        regular_price: Number(i.regular_price),
        currency: i.currency,
        image_url: i.image_url,
        product_link: i.product_link,
        product_type: i.product_type,
        status: i.status,
        review: i._count.visitors,
        weight: i.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formattedData)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Failed to load products" })
  }
})

// GET /api/products/sub-category/:name?page=1&limit=20
router.get("/sub-category/:name", async (req: Request, res: Response) => {
  const subCategorySlug = req.params.name
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  if (!subCategorySlug) {
    res.status(400).json({ error: "Invalid sub-category name" })
    return
  }

  try {
    // หา categorysub ที่ตรงกับ slug
    const subCategory = await prisma.categorysub.findFirst({
      where: { slugname: subCategorySlug },
    })

    if (!subCategory) {
      res.status(404).json({ error: "Sub-category not found" })
      return
    }

    // ดึง products
    const data = await prisma.products.findMany({
      where: {
        status: true,
        type: {
          categorysub_id: subCategory.id,
        },
      },
      skip,
      take: limit,
      include: {
        type: {
          include: {
            categorysub: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    const formatedData = data.map(i => {
      const { width, length, height } = parseProductSize(i.size)
      return {
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        unitname: i.unitname,
        category: i.type.categorysub.category.name,
        sub_category: i.type.categorysub.name,
        sub_category_id: i.type.categorysub.id,
        type: i.type.name,
        type_id: i.type_id,
        description: i.description,
        price: Number(i.price),
        regular_price: Number(i.regular_price),
        currency: i.currency,
        image_url: i.image_url,
        product_link: i.product_link,
        product_type: i.product_type,
        status: i.status,
        weight: i.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formatedData)
  } catch (error) {
    console.error("Error fetching products by sub-category:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/products/type/:slug?page=1&limit=20
router.get("/type/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  if (!slug) {
    res.status(400).json({ error: "Invalid type name" })
    return
  }

  try {
    const data = await prisma.products.findMany({
      where: {
        status: true,
        type: {
          slugname: slug,
        },
      },
      skip,
      take: limit,
      include: {
        type: {
          include: {
            categorysub: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    const formatedData = data.map(i => {
      const { width, length, height } = parseProductSize(i.size)
      return {
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        unitname: i.unitname,
        category: i.type.categorysub.category.name,
        sub_category: i.type.categorysub.name,
        sub_category_id: i.type.categorysub.id,
        type: i.type.name,
        type_id: i.type_id,
        description: i.description,
        price: Number(i.price),
        regular_price: Number(i.regular_price),
        currency: i.currency,
        image_url: i.image_url,
        product_link: i.product_link,
        product_type: i.product_type,
        status: i.status,
        weight: i.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formatedData)
  } catch (error) {
    console.error("Error fetching products by type:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/product-type/:type", async (req: Request, res: Response) => {
  const productType = req.params.type as ProductType
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  try {
    const data = await prisma.products.findMany({
      where: {
        status: true,
        product_type: productType,
      },
      skip,
      take: limit,
      include: {
        type: {
          include: {
            categorysub: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    const formattedData = data.map(i => {
      const { width, length, height } = parseProductSize(i.size)
      return {
        id: i.id,
        name: i.name,
        slugname: i.slugname,
        unitname: i.unitname,
        category: i.type.categorysub.category.name,
        category_id: i.type.categorysub.category.id,
        sub_category: i.type.categorysub.name,
        sub_category_id: i.type.categorysub.id,
        type: i.type.name,
        type_id: i.type_id,
        description: i.description,
        price: Number(i.price),
        regular_price: Number(i.regular_price),
        currency: i.currency,
        image_url: i.image_url,
        product_link: i.product_link,
        product_type: i.product_type,
        status: i.status,
        weight: i.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formattedData)
  } catch (error) {
    console.error("Error fetching products by product_type:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/products/search?q=บางอย่าง
router.get("/search", async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim()

  if (!q) {
    res.status(400).json({ error: "Missing search query" })
    return
  }

  try {
    const results = await prisma.products.findMany({
      where: {
        status: true,
        OR: [
          {
            name: {
              contains: q,
            },
          },
          {
            type: {
              name: {
                contains: q,
              },
            },
          },
          {
            type: {
              categorysub: {
                name: {
                  contains: q,
                },
              },
            },
          },
          {
            type: {
              categorysub: {
                category: {
                  name: {
                    contains: q,
                  },
                },
              },
            },
          },
          {
            brand: {
              name: {
                contains: q,
              },
            },
          },
        ],
      },
      take: 5,
      include: {
        type: {
          include: {
            categorysub: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    const formatted = results.map(item => {
      const { width, length, height } = parseProductSize(item.size)
      return {
        id: item.id,
        name: item.name,
        slugname: item.slugname,
        unitname: item.unitname,
        category: item.type.categorysub.category.name,
        sub_category: item.type.categorysub.name,
        type: item.type.name,
        description: item.description,
        price: Number(item.price),
        regular_price: Number(item.regular_price),
        currency: item.currency,
        image_url: item.image_url,
        product_link: item.product_link,
        product_type: item.product_type,
        status: item.status,
        weight: item.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    res.json(formatted)
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/products/brand/:brandName?page=1&limit=20
router.get("/brand/:brandName", async (req: Request, res: Response) => {
  const brandName = decodeURIComponent(req.params.brandName)
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  logging("GET", "frontend", `/brand/${brandName}`)

  try {
    // First find the brand by name
    const brand = await prisma.brand.findFirst({
      where: {
        slugname: {
          endsWith: brandName,
        },
        status: true,
      },
    })

    if (!brand) {
      res.status(404).json({ error: "Brand not found" })
      return
    }

    // Then get products for this brand
    const products = await prisma.products.findMany({
      where: {
        brand_id: brand.id,
        status: true,
      },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            visitors: true,
          },
        },
        type: {
          include: {
            categorysub: {
              include: {
                category: true,
              },
            },
          },
        },
        brand: {
          select: {
            name: true,
            logo_url: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    })

    const formattedData = products.map(product => {
      const { width, length, height } = parseProductSize(product.size)
      return {
        id: product.id,
        name: product.name,
        slugname: product.slugname,
        unitname: product.unitname,
        brand: {
          name: product.brand.name,
          logo_url: product.brand.logo_url,
        },
        category: product.type.categorysub.category.name,
        sub_category: product.type.categorysub.name,
        type: product.type.name,
        description: product.description,
        price: Number(product.price),
        regular_price: Number(product.regular_price),
        currency: product.currency,
        image_url: product.image_url,
        product_link: product.product_link,
        product_type: product.product_type,
        status: product.status,
        views: product._count.visitors,
        created: product.created,
        weight: product.weight,
        size: {
          width,
          length,
          height,
        },
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.products.count({
      where: {
        brand_id: brand.id,
        status: true,
      },
    })

    res.json({
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
      brandInfo: {
        name: brand.name,
        logo_url: brand.logo_url,
        description: brand.brand_description,
        website_link: brand.website_link,
      },
    })
  } catch (error) {
    console.error("Error fetching products by brand:", error)
    res.status(500).json({ error: "Failed to load products by brand" })
  }
})

export default router
