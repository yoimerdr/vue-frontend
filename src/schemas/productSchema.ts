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
