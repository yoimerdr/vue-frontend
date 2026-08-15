# Plan de Implementación — Frontend Vue 3 + TypeScript (Productos y Categorías)

> Este documento es el **plan de implementación**, no el código final. Sigue los pasos en orden; cada uno incluye el contenido literal de los archivos a crear/editar. Complementa a `laravel-app/PLAN.md` (backend). Basado en el enunciado `PRUEBA FULL STACK.pdf` + requisito adicional del usuario: frontend en **Vue + TypeScript**.

## 0. Estado actual detectado en `D:\php\vue-frontend`

Ya existe un scaffold Vite generado (`node_modules/` instalado, `bun.lock` presente) — **no hay que crear el proyecto de nuevo**, solo completarlo:

| Ya instalado | Detalle |
|---|---|
| Vite | `^8.2.0` |
| Vue | `^3.5.40` |
| TypeScript | `~6.0.2`, con `vue-tsc ^3.3.8` para el build (`vue-tsc -b && vite build`) |
| `@vitejs/plugin-vue` | `^6.0.8` |
| `@vue/tsconfig` | `^0.9.1` (usado por `tsconfig.app.json`) |
| Tailwind CSS | el import `@import "tailwindcss";` ya está en `src/style.css` (viene en la plantilla por defecto de Vite), pero **falta** el paquete `tailwindcss` + `@tailwindcss/vite` en `package.json` y el plugin en `vite.config.ts` — sin eso, Vite no puede resolver el `@import` |
| Gestor de paquetes | **Bun 1.3.13** (hay `bun.lock`, no `package-lock.json`) — confirmado disponible en el entorno |

**No instalado todavía**: Vue Router, Pinia, Axios, `vee-validate` + `zod`, alias de import `@`. No es un repositorio Git todavía (falta `git init`).

El scaffold trae una landing de demostración (`HelloWorld.vue`, `assets/hero.png`, `vue.svg`, `vite.svg`, estilos de "hero"/"next-steps" en `style.css`) que se reemplaza por la aplicación real — ver Paso 1.

**Gestor de paquetes elegido**: **Bun** (ya establecido en el repo, instalado y confirmado funcionando en este entorno — `bun -v` → `1.3.13`). Todos los comandos del plan usan `bun`; el README incluye el equivalente en `npm` como alternativa, por si quien evalúa la prueba no tiene Bun instalado.

---

## 1. Prerrequisitos

```bash
node -v   # >= 20 (hay v22.20.0 disponible)
bun -v    # 1.3.13 disponible; alternativa: npm (10.9.3 disponible)
```

El backend (`laravel-app`) debe estar corriendo en `http://localhost:8000` antes de probar el frontend end-to-end (ver `laravel-app/PLAN.md`).

---

## 2. Decisiones de arquitectura (firmes)

| Decisión | Elección | Razón |
|---|---|---|
| Lenguaje | TypeScript estricto en todo `src/` | Pedido explícito del usuario |
| Composition API | `<script setup lang="ts">` en todos los componentes | Requisito del enunciado; es el estándar actual de Vue 3 |
| Alias de imports | `@` → `src/` (en `vite.config.ts` y `tsconfig.app.json`) | Evita `../../../` y es el estándar del ecosistema Vue+Vite |
| Estilos | Tailwind CSS v4 vía `@tailwindcss/vite` (sin `tailwind.config.js`, config-less por defecto en v4) | Pedido explícito; v4 no necesita archivo de config para este alcance |
| HTTP | Axios con instancia única (`services/api.ts`) + interceptor de respuesta global | Pedido explícito: manejo global de errores en Axios |
| Vistas de categoría | **Una sola vista** `CategoryListView` con modal de creación/edición (CRUD completo sin ruta dedicada) | El enunciado solo exige 4 vistas mínimas y no lista un "Formulario de Categoría" aparte; el modal cumple el CRUD completo sin añadir una 5ª vista no pedida |
| Validación de formularios | `vee-validate` (Composition API `useForm`) + `zod` como schema, resueltos con `@vee-validate/zod` | Combinación estándar moderna en Vue 3 + TS, con inferencia de tipos automática desde el schema |
| Alertas / Toasts | Composable propio `useToast` + `ToastContainer.vue` (sin librería externa) | Requisito simple (éxito/error), evita una dependencia adicional y demuestra manejo de estado reactivo propio de Vue |
| Confirmación de borrado | Componente propio `ConfirmDialog.vue` | Mismo motivo — control total, sin dependencia extra |
| Estado de carga/éxito/error | Cada store Pinia expone `status: 'idle' \| 'loading' \| 'success' \| 'error'` + `error: string \| null` | Mapea 1:1 con el requisito "estados de carga, éxito y error" del enunciado |
| Errores de escritura (create/update/delete) | Se relanzan desde el store (no se atrapan ahí); el componente que llama hace `try/catch` para mapear errores 422 a campos del formulario | El interceptor de Axios ya muestra un toast para errores de red/4xx-no-422/5xx; los 422 se muestran *en el formulario*, no como toast genérico, para no duplicar el mensaje |
| Paginación | Se consume `meta` (`current_page`, `per_page`, `total`, `last_page`) devuelto por el backend | Contrato acordado con `laravel-app/PLAN.md` Paso 9 |

---

## 3. Estructura final esperada

```
vue-frontend/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ layout/AppLayout.vue
│  │  ├─ ui/Spinner.vue, ConfirmDialog.vue, ToastContainer.vue
│  │  ├─ categories/CategoryFormModal.vue
│  │  └─ products/ProductTable.vue
│  ├─ composables/
│  │  └─ useToast.ts
│  ├─ router/
│  │  └─ index.ts
│  ├─ schemas/
│  │  ├─ productSchema.ts
│  │  └─ categorySchema.ts
│  ├─ services/
│  │  ├─ api.ts
│  │  ├─ categoryService.ts
│  │  └─ productService.ts
│  ├─ stores/
│  │  ├─ category.ts
│  │  └─ product.ts
│  ├─ types/
│  │  ├─ api.ts
│  │  ├─ category.ts
│  │  └─ product.ts
│  ├─ utils/
│  │  └─ currency.ts
│  ├─ views/
│  │  ├─ DashboardView.vue
│  │  ├─ ProductListView.vue
│  │  ├─ ProductFormView.vue
│  │  └─ CategoryListView.vue
│  ├─ App.vue
│  ├─ main.ts
│  ├─ style.css
│  └─ env.d.ts
├─ .env / .env.example
├─ Dockerfile / nginx.conf / docker-compose.yml
└─ README.md
```

---

## 4. Paso 1 — Limpiar el scaffold de demostración

```bash
rm -rf src/components/HelloWorld.vue src/assets/hero.png src/assets/vue.svg src/assets/vite.svg public/icons.svg
```

Deja `public/favicon.svg` (ícono del sitio).

---

## 5. Paso 2 — Instalar dependencias

```bash
bun add vue-router pinia axios vee-validate zod @vee-validate/zod
bun add -d tailwindcss @tailwindcss/vite
```

---

## 6. Paso 3 — Configurar Vite (alias `@` + plugin de Tailwind)

Reemplaza `vite.config.ts` completo:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
```

---

## 7. Paso 4 — Configurar TypeScript (paths del alias)

Edita `tsconfig.app.json`, agrega `baseUrl` y `paths` dentro de `compilerOptions` (sin borrar lo existente):

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

---

## 8. Paso 5 — Variables de entorno

`.env` y `.env.example` (mismo contenido, sin secretos):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

`src/env.d.ts` (nuevo archivo — tipa `import.meta.env` para autocompletado y chequeo de tipos):

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 9. Paso 6 — Tipos TypeScript

`src/types/api.ts`:

```ts
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}
```

`src/types/category.ts`:

```ts
export interface Category {
  id: number
  name: string
  description: string | null
  products_count?: number
  created_at: string
  updated_at: string
}

export interface CategoryPayload {
  name: string
  description?: string | null
}
```

`src/types/product.ts`:

```ts
import type { Category } from './category'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  category_id: number
  category?: Category | null
  created_at: string
  updated_at: string
}

export interface ProductPayload {
  name: string
  description?: string | null
  price: number
  stock: number
  category_id: number
}

export interface ProductFilters {
  category_id?: number
  search?: string
  page?: number
  per_page?: number
}
```

---

## 10. Paso 7 — Cliente Axios + interceptor global de errores

`src/services/api.ts`:

```ts
import axios, { type AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import { useToast } from '@/composables/useToast'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

export interface NormalizedApiError {
  message: string
  errors: Record<string, string[]> | null
  status: number | null
}

function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedApiError {
  if (!error.response) {
    return { message: 'Error de red. Verifica tu conexión a internet.', errors: null, status: null }
  }

  const { status, data } = error.response

  return {
    message: data?.message ?? 'Ocurrió un error inesperado.',
    errors: data?.errors ?? null,
    status,
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalized = normalizeError(error)
    const toast = useToast()

    if (normalized.status === null) {
      toast.error(normalized.message)
    } else if (normalized.status === 422) {
      // Errores de validación: se muestran en el propio formulario, no como toast genérico.
    } else if (normalized.status === 404) {
      toast.error(normalized.message)
    } else if (normalized.status >= 500) {
      toast.error(normalized.message || 'Ocurrió un error en el servidor.')
    } else {
      toast.error(normalized.message)
    }

    return Promise.reject(normalized)
  }
)
```

Este interceptor es el único lugar que decide "¿esto se muestra como toast global o lo maneja el formulario?" — todo el resto de la app solo necesita `try/catch` alrededor de las llamadas de escritura para leer `error.errors` cuando aplique.

---

## 11. Paso 8 — Servicios por recurso

`src/services/categoryService.ts`:

```ts
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
```

`src/services/productService.ts`:

```ts
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
```

---

## 12. Paso 9 — Toasts (composable + contenedor)

`src/composables/useToast.ts`:

```ts
import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  type: ToastType
  text: string
}

// Estado module-level: singleton compartido por toda la app (patrón store minimalista).
const toasts = reactive<ToastMessage[]>([])
let nextId = 0

function push(type: ToastType, text: string, duration = 4000) {
  const id = nextId++
  toasts.push({ id, type, text })
  window.setTimeout(() => remove(id), duration)
}

function remove(id: number) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

export function useToast() {
  return {
    toasts,
    success: (text: string) => push('success', text),
    error: (text: string) => push('error', text),
    info: (text: string) => push('info', text),
    remove,
  }
}
```

`src/components/ui/ToastContainer.vue`:

```vue
<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const styles: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-700',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="text-white rounded-lg shadow-lg px-4 py-3 text-sm flex items-start justify-between gap-3"
        :class="styles[toast.type]"
      >
        <span>{{ toast.text }}</span>
        <button class="opacity-80 hover:opacity-100" @click="remove(toast.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

---

## 13. Paso 10 — Pinia stores

`src/stores/category.ts`:

```ts
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
```

`src/stores/product.ts`:

```ts
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
```

`fetchOne` deja el `loading` a cargo del componente (Paso 15) porque se usa en el formulario de edición, que ya maneja su propio estado local de carga inicial.

---

## 14. Paso 11 — Vue Router

`src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/products', name: 'products.index', component: () => import('@/views/ProductListView.vue') },
    { path: '/products/create', name: 'products.create', component: () => import('@/views/ProductFormView.vue') },
    { path: '/products/:id/edit', name: 'products.edit', component: () => import('@/views/ProductFormView.vue'), props: true },
    { path: '/categories', name: 'categories.index', component: () => import('@/views/CategoryListView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: { name: 'dashboard' } },
  ],
})

export default router
```

---

## 15. Paso 12 — Validación (vee-validate + zod)

`src/schemas/productSchema.ts`:

```ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  price: z.coerce
    .number({ invalid_type_error: 'El precio debe ser numérico' })
    .gt(0, 'El precio debe ser mayor que 0'),
  stock: z.coerce
    .number({ invalid_type_error: 'El stock debe ser numérico' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  category_id: z.coerce
    .number({ invalid_type_error: 'Selecciona una categoría' })
    .min(1, 'Selecciona una categoría'),
})

export type ProductFormValues = z.infer<typeof productSchema>
```

`src/schemas/categorySchema.ts`:

```ts
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
```

Estos dos schemas replican en el cliente las mismas reglas que los `FormRequest` de Laravel (Paso 10 del plan backend): nombre obligatorio, precio numérico y mayor que 0 — exactamente el ejemplo de validación del enunciado.

---

## 16. Paso 13 — Componentes reutilizables

`src/components/ui/Spinner.vue`:

```vue
<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' }
</script>

<template>
  <div
    class="animate-spin rounded-full border-indigo-600 border-t-transparent"
    :class="sizes[size]"
    role="status"
    aria-label="Cargando"
  />
</template>
```

`src/components/ui/ConfirmDialog.vue`:

```vue
<script setup lang="ts">
defineProps<{ open: boolean; title: string; message: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-600 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50" @click="emit('cancel')">
          Cancelar
        </button>
        <button class="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700" @click="emit('confirm')">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
```

`src/components/layout/AppLayout.vue`:

```vue
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <span class="font-semibold text-lg">Overskull · Panel</span>
        <nav class="flex gap-4 text-sm font-medium">
          <RouterLink to="/" class="hover:text-indigo-600" active-class="text-indigo-600">Dashboard</RouterLink>
          <RouterLink to="/products" class="hover:text-indigo-600" active-class="text-indigo-600">Productos</RouterLink>
          <RouterLink to="/categories" class="hover:text-indigo-600" active-class="text-indigo-600">Categorías</RouterLink>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <RouterView />
    </main>

    <ToastContainer />
  </div>
</template>
```

`src/components/products/ProductTable.vue`:

```vue
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
            <button class="text-indigo-600 hover:underline" @click="emit('edit', product)">Editar</button>
            <button class="text-red-600 hover:underline" @click="emit('delete', product)">Eliminar</button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="5" class="px-4 py-10 text-center text-slate-400">No hay productos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

`src/utils/currency.ts`:

```ts
const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatCurrency(value: number): string {
  return formatter.format(value)
}
```

`src/components/categories/CategoryFormModal.vue` (crear y editar categoría — cubre el CRUD completo sin una vista aparte):

```vue
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
          <button type="button" class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50" @click="emit('close')">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
```

---

## 17. Paso 14 — Vistas

`src/views/DashboardView.vue`:

```vue
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
```

`src/views/ProductListView.vue`:

```vue
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
      <button class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700" @click="router.push({ name: 'products.create' })">
        + Nuevo producto
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre..."
        class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <select
        v-model="categoryId"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
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
```

`src/views/ProductFormView.vue`:

```vue
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
        <select v-model.number="category_id" v-bind="categoryIdAttrs" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
          <option :value="0" disabled>Selecciona una categoría</option>
          <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="errors.category_id" class="text-sm text-red-600 mt-1">{{ errors.category_id }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50" @click="router.push({ name: 'products.index' })">
          Cancelar
        </button>
        <button type="submit" :disabled="submitting" class="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {{ submitting ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>
```

`src/views/CategoryListView.vue`:

```vue
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
      <button class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700" @click="openCreate">
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
          <button class="text-indigo-600 hover:underline" @click="openEdit(category)">Editar</button>
          <button class="text-red-600 hover:underline" @click="categoryToDelete = category">Eliminar</button>
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
```

---

## 18. Paso 15 — `App.vue`, `main.ts` y `style.css` finales

`src/App.vue`:

```vue
<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout />
</template>
```

`src/main.ts`:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
```

`src/style.css` (se reemplaza el CSS de la landing de demostración — `.hero`, `#next-steps`, `.ticks`, etc. pertenecían a la página que se borró en el Paso 1 — por una base mínima que deja el diseño 100% a las utilidades de Tailwind):

```css
@import "tailwindcss";

:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
}
```

Actualiza también el `<title>` en `index.html` de `vue-frontend` a algo descriptivo, por ejemplo `Overskull — Productos y Categorías`.

No se crea `tailwind.config.js`: Tailwind v4 no lo requiere para este alcance (no hay tema personalizado); si más adelante se necesita, se define con `@theme` dentro de `style.css`.

---

## 19. Paso 16 — Docker (opcional — cuenta en el 10% de "Extras")

`Dockerfile`:

```dockerfile
# Etapa 1: build
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Etapa 2: servir estáticos con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` (fallback a `index.html` para que las rutas de Vue Router funcionen al recargar la página):

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`docker-compose.yml`:

```yaml
services:
  frontend:
    build: .
    container_name: overskull_frontend
    ports:
      - "5173:80"
```

```bash
docker compose up -d --build
```

Frontend disponible en `http://localhost:5173`. Si el backend también corre en Docker (`laravel-app/docker-compose.yml`), asegúrate de que `VITE_API_BASE_URL` apunte a una URL alcanzable desde el navegador del usuario (típicamente `http://localhost:8000/api`, no el nombre del servicio interno de Docker — `VITE_API_BASE_URL` se resuelve en el navegador, no dentro de la red de contenedores).

---

## 20. Paso 17 — README.md

Crea `vue-frontend/README.md` con este contenido exacto:

````markdown
# Overskull Frontend — Vue 3 + TypeScript

SPA para la gestión de productos y categorías. Vue 3 (Composition API), TypeScript, Vite, Pinia, Vue Router, Tailwind CSS v4, Axios.

## Requisitos previos

- Node.js >= 20
- [Bun](https://bun.sh) >= 1.3 (recomendado) — alternativa: npm >= 10 (ver más abajo)
- Backend `laravel-app` corriendo (ver su propio README) en `http://localhost:8000`

## Instalación y ejecución

```bash
bun install
cp .env.example .env
bun run dev
```

Alternativa con npm (si no tienes Bun instalado):

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API Laravel | `http://localhost:8000/api` |

## Build de producción

```bash
bun run build   # genera dist/
bun run preview # sirve dist/ localmente para verificar el build
```

## Docker

```bash
docker compose up -d --build
```

Sirve el build de producción en `http://localhost:5173` vía Nginx.

## Estructura del proyecto

```
src/
  components/   Componentes reutilizables (layout, ui, por dominio)
  composables/  Lógica reactiva reutilizable (ej. useToast)
  router/       Definición de rutas
  schemas/      Esquemas de validación (zod)
  services/     Cliente Axios + funciones por recurso (categories, products)
  stores/       Estado global (Pinia): loading/success/error por recurso
  types/        Tipos e interfaces TypeScript
  views/        Pantallas (Dashboard, Productos, Categorías)
```

## Manejo de errores

- Todas las peticiones pasan por una instancia única de Axios (`src/services/api.ts`) con un interceptor de respuesta global.
- Errores de red o 5xx → toast de error genérico.
- Errores 404 → toast con el mensaje del backend.
- Errores 422 (validación) → **no** se muestran como toast; se mapean campo por campo en el formulario correspondiente (`vee-validate`), igual que como los devuelve la API.
- Cada store Pinia expone `status: 'idle' | 'loading' | 'success' | 'error'`, usado por las vistas para mostrar el spinner o el estado vacío/erróneo correspondiente.

## Vistas

1. **Dashboard** (`/`) — totales de productos/categorías y alerta de stock bajo.
2. **Productos** (`/products`) — listado con búsqueda y filtro por categoría; crear en `/products/create`, editar en `/products/:id/edit`.
3. **Categorías** (`/categories`) — listado con creación/edición vía modal y borrado con confirmación (CRUD completo en una sola vista).
````

---

## 21. Paso 18 — Verificación manual (checklist)

Con `laravel-app` corriendo en `:8000` y `vue-frontend` en `:5173`:

- [ ] El Dashboard muestra los totales correctos tras `php artisan migrate:fresh --seed` en el backend.
- [ ] `/products` lista los productos sembrados; el filtro por categoría y la búsqueda por nombre funcionan.
- [ ] Crear un producto con el formulario válido → toast de éxito, redirige al listado, aparece en la tabla.
- [ ] Enviar el formulario de producto vacío → errores de validación en cada campo (name, price, stock, category_id), **sin** toast duplicado.
- [ ] Editar un producto existente → el formulario carga los valores actuales.
- [ ] Borrar un producto → diálogo de confirmación, luego desaparece de la tabla.
- [ ] `/categories`: crear, editar y borrar una categoría vía el modal.
- [ ] Intentar borrar una categoría con productos asociados → toast con el mensaje 409 del backend (`"No se puede eliminar la categoría porque tiene productos asociados."`).
- [ ] Detener el backend y repetir una acción → toast "Error de red. Verifica tu conexión a internet."

---

## 22. Paso 19 — Git y entrega (acciones manuales del usuario)

Este asistente no crea repositorios remotos, hace push ni envía correos — son acciones que te corresponden a ti como entregable de la prueba:

```bash
git init
git add -A
git commit -m "Implementa frontend Vue 3 + TS para gestión de productos y categorías"
# crea el repo público en GitHub/GitLab, luego:
git remote add origin <URL_DE_TU_REPO>
git push -u origin main
```

Luego envía el link a `pierog@overskull.pe` según el enunciado, junto con el del repositorio `laravel-app`.

---

## 23. Checklist final mapeado a la rúbrica

| Criterio (enunciado) | Cómo se cumple en este plan |
|---|---|
| Arquitectura y estructura (25%) | Separación `components/composables/router/schemas/services/stores/types/views`, un store por recurso, capa de servicios propia |
| Uso correcto de Vue.js (25%) | Composition API + `<script setup lang="ts">` en todo, Pinia (Composition stores), Vue Router, componentes tipados con `defineProps`/`defineEmits` genéricos |
| Buenas prácticas y manejo de errores (15%) | Estados `loading/success/error` explícitos, interceptor global de Axios, validación cliente con vee-validate+zod espejando las reglas del backend |
| Extras (10%) | Docker (Nginx sirviendo el build), interceptor Axios, Toasts + ConfirmDialog propios, README completo |

## Fuera de alcance (no pedido, no se implementa)

Autenticación/login (el enunciado no lo pide y el backend no expone endpoints de auth), tests automatizados (Vitest) y `tailwind.config.js` (v4 no lo necesita para este alcance) — se documentan aquí solo para dejar explícito que la ausencia es una decisión, no un olvido.
