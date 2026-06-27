import { Prisma } from '@prisma/client'
import { prisma } from '../db/client'
import { CostoAdicional } from '../types'

interface LocalStorageCompra {
  id: string
  fecha: string
  agricultor: string
  tipoCafeId: string
  estado: 'humedo' | 'seco'
  kilos: number
  precioPorKilo: number
  costosAdicionales: CostoAdicional[]
  notas: string
  loteId?: string
}

interface LocalStorageLote {
  id: string
  nombre: string
  fechaCreacion: string
  compraIds: string[]
  precioVentaPorKilo?: number
  estado: 'abierto' | 'vendido'
  gastosAdicionales: CostoAdicional[]
}

interface LocalStorageTipoCafe {
  id: string
  nombre: string
  color: string
}

interface LocalStorageConfig {
  porcentajePerdidaSecado: number
  tiposCafe: LocalStorageTipoCafe[]
  costosFrecuentes: CostoAdicional[]
}

export interface MigrationPayload {
  compras: LocalStorageCompra[]
  lotes: LocalStorageLote[]
  config: LocalStorageConfig
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export async function importar(payload: MigrationPayload, usuarioId: string) {
  const { compras, lotes, config } = payload

  // 1. Tipos de café
  for (const tipo of config.tiposCafe) {
    await prisma.tipoCafe.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre, color: tipo.color },
      create: { id: tipo.id, nombre: tipo.nombre, color: tipo.color, usuarioId },
    })
  }

  // 2. Configuración
  await prisma.configuracion.upsert({
    where: { usuarioId },
    update: {
      porcentajePerdidaSecado: config.porcentajePerdidaSecado,
      costosFrecuentes: toJson(config.costosFrecuentes),
    },
    create: {
      id: `config-${usuarioId}`,
      porcentajePerdidaSecado: config.porcentajePerdidaSecado,
      costosFrecuentes: toJson(config.costosFrecuentes),
      usuarioId,
    },
  })

  // 3. Lotes (sin compras aún — las compras referencian lotes, no al revés)
  for (const lote of lotes) {
    await prisma.lote.upsert({
      where: { id: lote.id },
      update: {
        nombre: lote.nombre,
        gastosAdicionales: toJson(lote.gastosAdicionales),
        estado: lote.estado,
        precioVentaPorKilo: lote.precioVentaPorKilo ?? null,
      },
      create: {
        id: lote.id,
        nombre: lote.nombre,
        fechaCreacion: lote.fechaCreacion,
        estado: lote.estado,
        precioVentaPorKilo: lote.precioVentaPorKilo ?? null,
        gastosAdicionales: toJson(lote.gastosAdicionales),
        usuarioId,
      },
    })
  }

  // 4. Compras (con loteId si corresponde)
  for (const compra of compras) {
    await prisma.compra.upsert({
      where: { id: compra.id },
      update: {
        fecha: compra.fecha,
        agricultor: compra.agricultor,
        tipoCafeId: compra.tipoCafeId,
        estado: compra.estado,
        kilos: compra.kilos,
        precioPorKilo: compra.precioPorKilo,
        costosAdicionales: toJson(compra.costosAdicionales),
        notas: compra.notas,
        loteId: compra.loteId ?? null,
      },
      create: {
        id: compra.id,
        fecha: compra.fecha,
        agricultor: compra.agricultor,
        tipoCafeId: compra.tipoCafeId,
        estado: compra.estado,
        kilos: compra.kilos,
        precioPorKilo: compra.precioPorKilo,
        costosAdicionales: toJson(compra.costosAdicionales),
        notas: compra.notas,
        loteId: compra.loteId ?? null,
        usuarioId,
      },
    })
  }

  return {
    tiposCafe: config.tiposCafe.length,
    lotes: lotes.length,
    compras: compras.length,
  }
}
