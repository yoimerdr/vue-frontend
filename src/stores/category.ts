import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AsyncStatus, PaginationMeta } from '@/types/api'
import type { Category, CategoryPayload } from '@/types/category'
import * as categoryService from '@/services/categoryService'
import { useToast } from '@/composables/useToast'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<AsyncStatus>('idle')
  const error = ref<string | null>(null)

  async function fetchAll(page = 1) {
    status.value = 'loading'
    error.value = null
    try {
      const { data, meta: responseMeta } = await categoryService.list({ page })
      categories.value = data
      meta.value = responseMeta ?? null
      status.value = 'success'
    } catch (e) {
      status.value = 'error'
      error.value = (e as { message: string }).message
    }
  }

  async function create(payload: CategoryPayload) {
    const category = await categoryService.create(payload)
    categories.value.unshift(category)
    useToast().success('Categoría creada correctamente')
    return category
  }

  async function update(id: number, payload: CategoryPayload) {
    const category = await categoryService.update(id, payload)
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = category
    useToast().success('Categoría actualizada correctamente')
    return category
  }

  async function remove(id: number) {
    await categoryService.remove(id)
    categories.value = categories.value.filter((c) => c.id !== id)
    useToast().success('Categoría eliminada correctamente')
  }

  return { categories, meta, status, error, fetchAll, create, update, remove }
})
