# Overskull Frontend — Vue 3 + TypeScript

SPA para la gestión de productos y categorías. Vue 3 (Composition API), TypeScript, Vite, Pinia, Vue Router, Tailwind CSS v4, Axios.

## Requisitos previos

- Node.js >= 20
- [Bun](https://bun.sh) >= 1.3 (recomendado) — alternativa: npm >= 10 (ver más abajo)
- Backend `laravel-api` corriendo (ver su propio README) en `http://localhost:8000`

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
