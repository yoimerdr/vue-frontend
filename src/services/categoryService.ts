import { api } from './api'
import type { ApiSuccessResponse } from '@/types/api'
import type { Category, CategoryPayload } from '@/types/category'

export async function list(params: { page?: number; per_page?: number } = {}) {
  const { data } = await api.get<ApiSuccessResponse<Category[]>>('/categories', { params })
  return data
}

export async function get(id: number) {
  const { data } = await api.get<ApiSuccessResponse<Category>>(`/categories/${id}`)
  return data.data
}

export async function create(payload: CategoryPayload) {
  const { data } = await api.post<ApiSuccessResponse<Category>>('/categories', payload)
  return data.data
}

export async function update(id: number, payload: CategoryPayload) {
  const { data } = await api.put<ApiSuccessResponse<Category>>(`/categories/${id}`, payload)
  return data.data
}

export async function remove(id: number) {
  await api.delete(`/categories/${id}`)
}
