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
        <button class="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer" @click="emit('cancel')">
          Cancelar
        </button>
        <button class="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer" @click="emit('confirm')">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
