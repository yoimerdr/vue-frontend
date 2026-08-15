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
