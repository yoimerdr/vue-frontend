<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import Spinner from '@/components/ui/Spinner.vue'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  productStore.fetchAll({ per_page: 100 })
  categoryStore.fetchAll(1)
})

const totalProducts = computed(() => productStore.meta?.total ?? productStore.products.length)
const totalCategories = computed(() => categoryStore.meta?.total ?? categoryStore.categories.length)
const totalStock = computed(() => productStore.products.reduce((sum, p) => sum + p.stock, 0))
const lowStock = computed(() => productStore.products.filter((p) => p.stock <= 5))
const isLoading = computed(() => productStore.status === 'loading' || categoryStore.status === 'loading')
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Dashboard</h1>

    <div v-if="isLoading" class="flex justify-center py-10"><Spinner /></div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg border border-slate-200 p-5">
        <p class="text-sm text-slate-500">Productos</p>
        <p class="text-3xl font-semibold">{{ totalProducts }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-200 p-5">
        <p class="text-sm text-slate-500">Categorías</p>
        <p class="text-3xl font-semibold">{{ totalCategories }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-200 p-5">
        <p class="text-sm text-slate-500">Stock total</p>
        <p class="text-3xl font-semibold">{{ totalStock }}</p>
      </div>
    </div>

    <div v-if="!isLoading && lowStock.length" class="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4">
      <p class="font-medium mb-1">Productos con poco stock (≤ 5 unidades)</p>
      <ul class="list-disc list-inside text-sm">
        <li v-for="p in lowStock" :key="p.id">{{ p.name }} — {{ p.stock }} unidades</li>
      </ul>
    </div>
  </div>
</template>
