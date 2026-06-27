import { Prisma } from '@prisma/client'
import { prisma } from '../db/client'
import { LoteCreate, LoteUpdate } from '../schemas/lote.schema'

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type LoteRow = {
  compras: Array<{ id: string } & Record<string, unknown>>
} & Record<string, unknown>

function formatLote(lote: LoteRow) {
  const { compras, ...rest } = lote
  return { ...rest, compraIds: compras.map((c) => c.id) }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export async function listar(usuarioId: string) {
  const lotes = await prisma.lote.findMany({
    where: { usuarioId },
    include: { compras: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return lotes.map((l) => formatLote(l as unknown as LoteRow))
}

export async function obtener(id: string, usuarioId: string) {
  const lote = await prisma.lote.findFirst({
    where: { id, usuarioId },
    include: { compras: { include: { tipoCafe: true } } },
  })
  if (!lote) return null
  return formatLote(lote as unknown as LoteRow)
}

export async function crear(data: LoteCreate, usuarioId: string) {
  const lote = await prisma.lote.create({
    data: {
      id: data.id ?? generarId(),
      nombre: data.nombre,
      fechaCreacion: data.fechaCreacion,
      gastosAdicionales: toJson(data.gastosAdicionales ?? []),
      estado: data.estado ?? 'abierto',
      precioVentaPorKilo: data.precioVentaPorKilo ?? null,
      usuarioId,
    },
    include: { compras: { select: { id: true } } },
  })
  return formatLote(lote as unknown as LoteRow)
}

export async function actualizar(id: string, data: LoteUpdate, usuarioId: string) {
  const existente = await prisma.lote.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  const lote = await prisma.lote.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.gastosAdicionales !== undefined && {
        gastosAdicionales: toJson(data.gastosAdicionales),
      }),
    },
    include: { compras: { select: { id: true } } },
  })
  return formatLote(lote as unknown as LoteRow)
}

export async function vender(id: string, precioVentaPorKilo: number, usuarioId: string) {
  const existente = await prisma.lote.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  const lote = await prisma.lote.update({
    where: { id },
    data: { precioVentaPorKilo, estado: 'vendido' },
    include: { compras: { select: { id: true } } },
  })
  return formatLote(lote as unknown as LoteRow)
}

export async function actualizarCompras(id: string, compraIds: string[], usuarioId: string) {
  const existente = await prisma.lote.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  await prisma.compra.updateMany({ where: { loteId: id, usuarioId }, data: { loteId: null } })

  if (compraIds.length > 0) {
    await prisma.compra.updateMany({
      where: { id: { in: compraIds }, usuarioId },
      data: { loteId: id },
    })
  }

  return obtener(id, usuarioId)
}

export async function eliminar(id: string, usuarioId: string) {
  const existente = await prisma.lote.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  await prisma.compra.updateMany({ where: { loteId: id }, data: { loteId: null } })
  return prisma.lote.delete({ where: { id } })
}
