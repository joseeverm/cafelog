import { z } from 'zod'

const costoAdicionalSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1),
  monto: z.number().int().nonnegative(),
})

export const loteCreateSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  fechaCreacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  gastosAdicionales: z.array(costoAdicionalSchema).default([]),
  estado: z.enum(['abierto', 'vendido']).optional(),
  precioVentaPorKilo: z.number().int().positive().optional(),
})

export const loteUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  gastosAdicionales: z.array(costoAdicionalSchema).optional(),
})

export const venderLoteSchema = z.object({
  precioVentaPorKilo: z.number().int().positive(),
})

export const comprasLoteSchema = z.object({
  compraIds: z.array(z.string()),
})

export type LoteCreate = z.infer<typeof loteCreateSchema>
export type LoteUpdate = z.infer<typeof loteUpdateSchema>
