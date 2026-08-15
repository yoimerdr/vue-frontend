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
