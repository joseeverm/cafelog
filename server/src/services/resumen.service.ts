import { prisma } from '../db/client'
import { kilosSecos, totalPagadoCompra, semanaAFechas } from './calculos.service'
import { CostoAdicional } from '../types'

export interface ResumenSemana {
  semana: string
  totalKilosComprados: number
  totalKilosSecos: number
  totalInvertido: number
  cantidadCompras: number
}

export async function resumenSemana(semana: string, usuarioId: string): Promise<ResumenSemana> {
  const config = await prisma.configuracion.findUnique({ where: { usuarioId } })
  const porcentajePerdida = config?.porcentajePerdidaSecado ?? 50

  const { inicio, fin } = semanaAFechas(semana)

  const compras = await prisma.compra.findMany({
    where: { usuarioId, fecha: { gte: inicio, lte: fin } },
  })

  const totalKilosComprados = compras.reduce((sum, c) => sum + c.kilos, 0)
  const totalKilosSecos = compras.reduce(
    (sum, c) => sum + kilosSecos(c.kilos, c.estado as 'humedo' | 'seco', porcentajePerdida),
    0,
  )
  const totalInvertido = compras.reduce(
    (sum, c) =>
      sum + totalPagadoCompra(c.kilos, c.precioPorKilo, c.costosAdicionales as unknown as CostoAdicional[]),
    0,
  )

  return {
    semana,
    totalKilosComprados,
    totalKilosSecos,
    totalInvertido,
    cantidadCompras: compras.length,
  }
}
