import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AsyncStatus, PaginationMeta } from '@/types/api'
import type { Product, ProductPayload, ProductFilters } from '@/types/product'
import * as productService from '@/services/productService'
import { useToast } from '@/composables/useToast'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<AsyncStatus>('idle')
  const error = ref<string | null>(null)

  async function fetchAll(filters: ProductFilters = {}) {
    status.value = 'loading'
    error.value = null
    try {
      const { data, meta: responseMeta } = await productService.list(filters)
      products.value = data
      meta.value = responseMeta ?? null
      status.value = 'success'
    } catch (e) {
      status.value = 'error'
      error.value = (e as { message: string }).message
    }
  }

  function fetchOne(id: number) {
    return productService.get(id)
  }

  async function create(payload: ProductPayload) {
    const product = await productService.create(payload)
    products.value.unshift(product)
    useToast().success('Producto creado correctamente')
    return product
  }

  async function update(id: number, payload: ProductPayload) {
    const product = await productService.update(id, payload)
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) products.value[index] = product
    useToast().success('Producto actualizado correctamente')
    return product
  }

  async function remove(id: number) {
    await productService.remove(id)
    products.value = products.value.filter((p) => p.id !== id)
    useToast().success('Producto eliminado correctamente')
  }

  return { products, meta, status, error, fetchAll, fetchOne, create, update, remove }
})
