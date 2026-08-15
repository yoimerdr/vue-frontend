import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
