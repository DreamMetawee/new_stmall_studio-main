export interface ServiceCategoryProps {
  id: number
  name: string
  description: string
  image_path: string
}

export interface ServiceItemProps {
  id: number
  name: string
  description: string
  image_path: string
}

export interface CoBusinessProps {
  id: number
  name: string
  logo_path: string
  website_url: string
}

export interface SaleTeamProps {
  order_step: number
  id: number
  name: string
  position: string
  description: string
  image_path: string
}

export interface OurStoreProps {
  id: number
  store_image: string
  name: string
  address: string
  phone: string
  email: string
  opening_hours: string
  map_embed: string
}

export interface FAQProps {
  id: number
  question: string
  answer: string
}
