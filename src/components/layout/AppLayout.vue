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
