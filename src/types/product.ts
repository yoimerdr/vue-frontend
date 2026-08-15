import type { Category } from './category'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  category_id: number
  category?: Category | null
  created_at: string
  updated_at: string
}

export interface ProductPayload {
  name: string
  description?: string | null
  price: number
  stock: number
  category_id: number
}

export interface ProductFilters {
  category_id?: number
  search?: string
  page?: number
  per_page?: number
}
