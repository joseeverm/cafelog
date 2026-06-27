import { prisma } from '../db/client'
import { ConfiguracionUpdate } from '../schemas/configuracion.schema'

export async function obtener(usuarioId: string) {
  const config = await prisma.configuracion.findUnique({ where: { usuarioId } })
  const tiposCafe = await prisma.tipoCafe.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'asc' },
  })

  if (!config) {
    return {
      porcentajePerdidaSecado: 50,
      costosFrecuentes: [],
      tiposCafe,
    }
  }

  return {
    porcentajePerdidaSecado: config.porcentajePerdidaSecado,
    costosFrecuentes: config.costosFrecuentes,
    tiposCafe,
  }
}

export async function actualizar(data: ConfiguracionUpdate, usuarioId: string) {
  const config = await prisma.configuracion.upsert({
    where: { usuarioId },
    update: {
      ...(data.porcentajePerdidaSecado !== undefined && {
        porcentajePerdidaSecado: data.porcentajePerdidaSecado,
      }),
      ...(data.costosFrecuentes !== undefined && { costosFrecuentes: data.costosFrecuentes }),
    },
    create: {
      id: `config-${usuarioId}`,
      porcentajePerdidaSecado: data.porcentajePerdidaSecado ?? 50,
      costosFrecuentes: data.costosFrecuentes ?? [],
      usuarioId,
    },
  })

  return obtener(usuarioId)
}
