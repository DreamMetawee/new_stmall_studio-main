export interface MainCategoryProps {
  id: number
  name: string
  icon: string
  sub_category_count: number
}

export interface SubCategoryProps {
  id: number
  name: string
  main_category_id: number
  main_category_name: string
  product_type_count: number
}

export interface ProductTypeProps {
  id: number
  name: string
  main_category_name: string
  sub_category: string
  sub_category_name: string
  product_count: number
}
