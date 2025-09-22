export interface DropdownItemProps {
  label: string
  href: string
}

export interface ProductProps {
  id: number
  name: string
  unitname: string
  brand_id: number
  brand_name: string
  category_id: number
  category_name: string
  description: string
  price: number
  regular_price: number
  currency: string
  image_url: string
  product_type: number
  reviews: number
  updated_at?: string
}

export interface CategoryProps {
  id: number
  name: string
  createur: string
  updateur: string
}
export type CategoryChoose = Pick<CategoryProps, "id" | "name">

export interface BrandProps {
  id: number
  created_at: Date
  updated_at: Date
  name: string
  logo_url: string
  brand_description: string
  website_link: string
}
export type BrandChoose = Pick<BrandProps, "id" | "name">

export interface UserProps {
  id: number
  name: string
  nickname: string
  permission: "user" | "admin"
  username: string
  phone: string
  avatar: null
}

export interface PromotionProps {
  id: number
  name: string
  description: string
  link: string
  createur: string
  created: string
  status: number
}

export interface cookiePolicyProps {
  id:number
  content:string
  version:number
  isActive:boolean
  created:string
  updated:string
}