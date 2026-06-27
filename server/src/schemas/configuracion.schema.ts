import { z } from 'zod'

const costoAdicionalSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1),
  monto: z.number().int().nonnegative(),
})

export const configuracionUpdateSchema = z.object({
  porcentajePerdidaSecado: z.number().int().min(1).max(99).optional(),
  costosFrecuentes: z.array(costoAdicionalSchema).optional(),
})

export type ConfiguracionUpdate = z.infer<typeof configuracionUpdateSchema>
