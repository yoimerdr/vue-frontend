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
