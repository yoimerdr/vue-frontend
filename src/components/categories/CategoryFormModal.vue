<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { categorySchema, type CategoryFormValues } from '@/schemas/categorySchema'
import type { Category } from '@/types/category'

const props = defineProps<{ open: boolean; category?: Category | null }>()
const emit = defineEmits<{ close: []; submit: [values: CategoryFormValues] }>()

const { handleSubmit, defineField, errors, resetForm, setErrors } = useForm<CategoryFormValues>({
  validationSchema: toTypedSchema(categorySchema),
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm({
        values: {
          name: props.category?.name ?? '',
          description: props.category?.description ?? '',
        },
      })
    }
  }
)

defineExpose({ setErrors })

const onSubmit = handleSubmit((values) => emit('submit', values))
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">{{ category ? 'Editar categoría' : 'Nueva categoría' }}</h3>

      <form class="space-y-4" @submit="onSubmit">
        <div>
          <label class="block text-sm font-medium mb-1">Nombre</label>
          <input
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            v-model="description"
            v-bind="descriptionAttrs"
            rows="3"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <p v-if="errors.description" class="text-sm text-red-600 mt-1">{{ errors.description }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer" @click="emit('close')">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
