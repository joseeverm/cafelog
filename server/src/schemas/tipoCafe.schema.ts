import { z } from 'zod'

export const tipoCafeInputSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color debe ser hex de 6 dígitos (ej: #b8833a)'),
})

export type TipoCafeInput = z.infer<typeof tipoCafeInputSchema>
