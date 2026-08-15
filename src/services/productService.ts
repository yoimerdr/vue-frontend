import { api } from './api'
import type { ApiSuccessResponse } from '@/types/api'
import type { Product, ProductPayload, ProductFilters } from '@/types/product'

export async function list(filters: ProductFilters = {}) {
  const { data } = await api.get<ApiSuccessResponse<Product[]>>('/products', { params: filters })
  return data
}

export async function get(id: number) {
  const { data } = await api.get<ApiSuccessResponse<Product>>(`/products/${id}`)
  return data.data
}

export async function create(payload: ProductPayload) {
  const { data } = await api.post<ApiSuccessResponse<Product>>('/products', payload)
  return data.data
}

export async function update(id: number, payload: ProductPayload) {
  const { data } = await api.put<ApiSuccessResponse<Product>>(`/products/${id}`, payload)
  return data.data
}

export async function remove(id: number) {
  await api.delete(`/products/${id}`)
}
