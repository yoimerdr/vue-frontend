<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { productSchema, type ProductFormValues } from '@/schemas/productSchema'
import Spinner from '@/components/ui/Spinner.vue'
import type { NormalizedApiError } from '@/services/api'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const productId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => productId.value !== null)
const loading = ref(false)
const submitting = ref(false)

const { handleSubmit, defineField, errors, setErrors, setValues } = useForm<ProductFormValues>({
  validationSchema: toTypedSchema(productSchema),
  initialValues: { name: '', description: '', price: 0, stock: 0, category_id: 0 },
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [price, priceAttrs] = defineField('price')
const [stock, stockAttrs] = defineField('stock')
const [category_id, categoryIdAttrs] = defineField('category_id')

onMounted(async () => {
  if (categoryStore.categories.length === 0) await categoryStore.fetchAll(1)

  if (isEdit.value && productId.value) {
    loading.value = true
    try {
      const product = await productStore.fetchOne(productId.value)
      setValues({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
      })
    } catch {
      // Id inválido o producto no encontrado: no dejamos el formulario colgado, volvemos al listado.
      router.push({ name: 'products.index' })
    } finally {
      loading.value = false
    }
  }
})

const onSubmit = handleSubmit(async (values) => {
  submitting.value = true
  try {
    if (isEdit.value && productId.value) {
      await productStore.update(productId.value, values)
    } else {
      await productStore.create(values)
    }
    router.push({ name: 'products.index' })
  } catch (e) {
    const apiError = e as NormalizedApiError
    if (apiError.errors) {
      setErrors(Object.fromEntries(Object.entries(apiError.errors).map(([field, msgs]) => [field, msgs[0]])))
    }
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="max-w-xl space-y-4">
    <h1 class="text-2xl font-semibold">{{ isEdit ? 'Editar producto' : 'Nuevo producto' }}</h1>

    <div v-if="loading" class="flex justify-center py-10"><Spinner /></div>

    <form v-else class="space-y-4 bg-white border border-slate-200 rounded-lg p-6" @submit="onSubmit">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input v-model="name" v-bind="nameAttrs" type="text" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Descripción</label>
        <textarea v-model="description" v-bind="descriptionAttrs" rows="3" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        <p v-if="errors.description" class="text-sm text-red-600 mt-1">{{ errors.description }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Precio</label>
          <input v-model.number="price" v-bind="priceAttrs" type="number" step="0.01" min="0" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <p v-if="errors.price" class="text-sm text-red-600 mt-1">{{ errors.price }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Stock</label>
          <input v-model.number="stock" v-bind="stockAttrs" type="number" min="0" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <p v-if="errors.stock" class="text-sm text-red-600 mt-1">{{ errors.stock }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Categoría</label>
        <select v-model.number="category_id" v-bind="categoryIdAttrs" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white">
          <option :value="0" disabled>Selecciona una categoría</option>
          <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="errors.category_id" class="text-sm text-red-600 mt-1">{{ errors.category_id }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer" @click="router.push({ name: 'products.index' })">
          Cancelar
        </button>
        <button type="submit" :disabled="submitting" class="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
          {{ submitting ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>
