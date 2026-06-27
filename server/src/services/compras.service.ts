import { prisma } from '../db/client'
import { CompraInput } from '../schemas/compra.schema'
import { semanaAFechas } from './calculos.service'

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface FiltrosCompra {
  semana?: string
  tipoCafeId?: string
  agricultor?: string
  estado?: 'humedo' | 'seco'
  loteId?: string | 'null'
}

export async function listar(usuarioId: string, filtros: FiltrosCompra = {}) {
  const where: Record<string, unknown> = { usuarioId }

  if (filtros.semana) {
    const { inicio, fin } = semanaAFechas(filtros.semana)
    where['fecha'] = { gte: inicio, lte: fin }
  }
  if (filtros.tipoCafeId) where['tipoCafeId'] = filtros.tipoCafeId
  if (filtros.agricultor) where['agricultor'] = { contains: filtros.agricultor, mode: 'insensitive' }
  if (filtros.estado) where['estado'] = filtros.estado
  if (filtros.loteId === 'null') {
    where['loteId'] = null
  } else if (filtros.loteId) {
    where['loteId'] = filtros.loteId
  }

  return prisma.compra.findMany({
    where,
    orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    include: { tipoCafe: true },
  })
}

export async function obtener(id: string, usuarioId: string) {
  return prisma.compra.findFirst({
    where: { id, usuarioId },
    include: { tipoCafe: true },
  })
}

export async function crear(data: CompraInput, usuarioId: string) {
  return prisma.compra.create({
    data: {
      id: data.id ?? generarId(),
      fecha: data.fecha,
      agricultor: data.agricultor,
      tipoCafeId: data.tipoCafeId,
      estado: data.estado,
      kilos: data.kilos,
      precioPorKilo: data.precioPorKilo,
      costosAdicionales: data.costosAdicionales,
      notas: data.notas,
      loteId: data.loteId ?? null,
      usuarioId,
    },
    include: { tipoCafe: true },
  })
}

export async function actualizar(id: string, data: CompraInput, usuarioId: string) {
  const existente = await prisma.compra.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  return prisma.compra.update({
    where: { id },
    data: {
      fecha: data.fecha,
      agricultor: data.agricultor,
      tipoCafeId: data.tipoCafeId,
      estado: data.estado,
      kilos: data.kilos,
      precioPorKilo: data.precioPorKilo,
      costosAdicionales: data.costosAdicionales,
      notas: data.notas,
      loteId: data.loteId ?? null,
    },
    include: { tipoCafe: true },
  })
}

export async function eliminar(id: string, usuarioId: string) {
  const existente = await prisma.compra.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  return prisma.compra.delete({ where: { id } })
}
