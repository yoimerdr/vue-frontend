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
