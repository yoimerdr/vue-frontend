<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCategoryStore } from '@/stores/category'
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Spinner from '@/components/ui/Spinner.vue'
import type { Category } from '@/types/category'
import type { CategoryFormValues } from '@/schemas/categorySchema'
import type { NormalizedApiError } from '@/services/api'

const categoryStore = useCategoryStore()

const modalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)
const modalRef = ref<InstanceType<typeof CategoryFormModal> | null>(null)

onMounted(() => categoryStore.fetchAll(1))

function openCreate() {
  editingCategory.value = null
  modalOpen.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  modalOpen.value = true
}

async function handleSubmit(values: CategoryFormValues) {
  try {
    if (editingCategory.value) {
      await categoryStore.update(editingCategory.value.id, values)
    } else {
      await categoryStore.create(values)
    }
    modalOpen.value = false
  } catch (e) {
    const apiError = e as NormalizedApiError
    if (apiError.errors) {
      modalRef.value?.setErrors(Object.fromEntries(Object.entries(apiError.errors).map(([field, msgs]) => [field, msgs[0]])))
    }
  }
}

async function confirmDelete() {
  if (!categoryToDelete.value) return
  try {
    await categoryStore.remove(categoryToDelete.value.id)
  } catch {
    // El interceptor de Axios ya mostró el toast de error (p. ej. 409 por productos asociados).
  } finally {
    categoryToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Categorías</h1>
      <button class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700 cursor-pointer" @click="openCreate">
        + Nueva categoría
      </button>
    </div>

    <div v-if="categoryStore.status === 'loading'" class="flex justify-center py-10"><Spinner /></div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="category in categoryStore.categories" :key="category.id" class="bg-white border border-slate-200 rounded-lg p-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-medium">{{ category.name }}</p>
            <p class="text-sm text-slate-500">{{ category.description || 'Sin descripción' }}</p>
          </div>
          <span class="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-1">{{ category.products_count ?? 0 }} productos</span>
        </div>
        <div class="mt-3 flex gap-3 text-sm">
          <button class="text-indigo-600 hover:underline cursor-pointer" @click="openEdit(category)">Editar</button>
          <button class="text-red-600 hover:underline cursor-pointer" @click="categoryToDelete = category">Eliminar</button>
        </div>
      </div>

      <p v-if="categoryStore.categories.length === 0" class="text-slate-400 col-span-full text-center py-10">
        No hay categorías registradas.
      </p>
    </div>

    <CategoryFormModal
      ref="modalRef"
      :open="modalOpen"
      :category="editingCategory"
      @close="modalOpen = false"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      :open="categoryToDelete !== null"
      title="Eliminar categoría"
      :message="`¿Seguro que deseas eliminar '${categoryToDelete?.name}'? No se podrá eliminar si tiene productos asociados.`"
      @confirm="confirmDelete"
      @cancel="categoryToDelete = null"
    />
  </div>
</template>
