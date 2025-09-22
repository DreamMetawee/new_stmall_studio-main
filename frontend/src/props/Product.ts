export interface ProductProps {
  id: number
  name: string
  description: string
  brand_id: string
  type_id: string
  image_url: string
  price: number
  regular_price: number
  currency: string
  product_type: "TYPE_1" | "TYPE_2" | "TYPE_3"
  unitname: string
  status: boolean
}

export interface HeroProductProps {
  id: string
  name: string
  image_url: string
  description: string
  discount: string
  link: string
  status: boolean
}

export interface PromotionProps {
  id: string
  image_url: string
  name: string
  description: string
  link: string
  status: boolean
}

export interface BrandProps {
  id: string
  name: string
  logo_url: string
  brand_description: string
  website_link: string
  status: string
}

export interface CatalogProps {
  id: number
  name: string
  image: string
  catalog_link: string
  category_id: number
  status: boolean
  createur: string
  updateur: string
  created: string
  updated: string
  item_count: number
  category: {
    name: string
  }
  catelogImages?: {
    id: number
    image: string
  }[]
}
