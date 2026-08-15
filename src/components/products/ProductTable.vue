<script setup lang="ts">
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/currency'

defineProps<{ products: Product[] }>()
const emit = defineEmits<{ edit: [product: Product]; delete: [product: Product] }>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 text-left text-slate-500">
        <tr>
          <th class="px-4 py-3 font-medium">Nombre</th>
          <th class="px-4 py-3 font-medium">Categoría</th>
          <th class="px-4 py-3 font-medium">Precio</th>
          <th class="px-4 py-3 font-medium">Stock</th>
          <th class="px-4 py-3 font-medium text-right">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="product in products" :key="product.id">
          <td class="px-4 py-3">
            <p class="font-medium text-slate-900">{{ product.name }}</p>
            <p class="text-slate-500 line-clamp-1">{{ product.description }}</p>
          </td>
          <td class="px-4 py-3">{{ product.category?.name ?? '—' }}</td>
          <td class="px-4 py-3">{{ formatCurrency(product.price) }}</td>
          <td class="px-4 py-3">
            <span :class="product.stock === 0 ? 'text-red-600' : 'text-slate-700'">{{ product.stock }}</span>
          </td>
          <td class="px-4 py-3 text-right space-x-2">
            <button class="text-indigo-600 hover:underline cursor-pointer" @click="emit('edit', product)">Editar</button>
            <button class="text-red-600 hover:underline cursor-pointer" @click="emit('delete', product)">Eliminar</button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="5" class="px-4 py-10 text-center text-slate-400">No hay productos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
