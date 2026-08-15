<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import ProductTable from '@/components/products/ProductTable.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Spinner from '@/components/ui/Spinner.vue'
import type { Product } from '@/types/product'

const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const search = ref('')
const categoryId = ref<number | ''>('')
const productToDelete = ref<Product | null>(null)

function load() {
  productStore.fetchAll({
    search: search.value || undefined,
    category_id: categoryId.value || undefined,
  })
}

onMounted(() => {
  load()
  if (categoryStore.categories.length === 0) categoryStore.fetchAll(1)
})

watch([search, categoryId], () => load())

function goToEdit(product: Product) {
  router.push({ name: 'products.edit', params: { id: product.id } })
}

async function confirmDelete() {
  if (!productToDelete.value) return
  try {
    await productStore.remove(productToDelete.value.id)
  } catch {
    // El interceptor de Axios ya mostró el toast de error; solo evitamos una promesa sin capturar.
  } finally {
    productToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Productos</h1>
      <button class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700 cursor-pointer" @click="router.push({ name: 'products.create' })">
        + Nuevo producto
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre..."
        class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
      />
      <select
        v-model="categoryId"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
      >
        <option value="">Todas las categorías</option>
        <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div v-if="productStore.status === 'loading'" class="flex justify-center py-10"><Spinner /></div>
    <p v-else-if="productStore.status === 'error'" class="text-red-600 text-sm">{{ productStore.error }}</p>
    <ProductTable
      v-else
      :products="productStore.products"
      @edit="goToEdit"
      @delete="(p) => (productToDelete = p)"
    />

    <ConfirmDialog
      :open="productToDelete !== null"
      title="Eliminar producto"
      :message="`¿Seguro que deseas eliminar '${productToDelete?.name}'? Esta acción no se puede deshacer.`"
      @confirm="confirmDelete"
      @cancel="productToDelete = null"
    />
  </div>
</template>
