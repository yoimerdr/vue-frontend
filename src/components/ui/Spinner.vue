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
