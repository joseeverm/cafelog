import { z } from 'zod'

const costoAdicionalSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1),
  monto: z.number().int().nonnegative(),
})

export const compraInputSchema = z.object({
  id: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  agricultor: z.string().min(1),
  tipoCafeId: z.string().min(1),
  estado: z.enum(['humedo', 'seco']),
  kilos: z.number().positive(),
  precioPorKilo: z.number().int().nonnegative(),
  costosAdicionales: z.array(costoAdicionalSchema).default([]),
  notas: z.string().default(''),
  loteId: z.string().nullable().optional(),
})

export type CompraInput = z.infer<typeof compraInputSchema>
