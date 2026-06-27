import type { Compra, Lote, Configuracion, ResumenSemana, EstadoCafe } from '../types'

export function kilosSecos(kilos: number, estado: EstadoCafe, porcentajePerdida: number): number {
  if (estado === 'humedo') return kilos * (1 - porcentajePerdida / 100)
  return kilos
}

export function totalCostosAdicionales(compra: Compra): number {
  return compra.costosAdicionales.reduce((sum, c) => sum + c.monto, 0)
}

export function totalPagadoCompra(compra: Compra): number {
  return compra.kilos * compra.precioPorKilo + totalCostosAdicionales(compra)
}

export function totalInvertido(compras: Compra[]): number {
  return compras.reduce((sum, c) => sum + totalPagadoCompra(c), 0)
}

export function kilosSecosTotales(compras: Compra[], config: Configuracion): number {
  return compras.reduce((sum, c) => sum + kilosSecos(c.kilos, c.estado, config.porcentajePerdidaSecado), 0)
}

export function totalGastosLote(lote: Lote): number {
  return (lote.gastosAdicionales ?? []).reduce((sum, g) => sum + g.monto, 0)
}

export function gananciaLote(lote: Lote, todasLasCompras: Compra[], config: Configuracion): number | null {
  if (!lote.precioVentaPorKilo) return null
  const comprasDelLote = todasLasCompras.filter(c => lote.compraIds.includes(c.id))
  const secos = kilosSecosTotales(comprasDelLote, config)
  const invertido = totalInvertido(comprasDelLote) + totalGastosLote(lote)
  return secos * lote.precioVentaPorKilo - invertido
}

export function getSemanaISO(fecha: Date): string {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function getSemanaActual(): string {
  return getSemanaISO(new Date())
}

export function getLunesDeSemana(semana: string): Date {
  const [year, week] = semana.split('-W').map(Number)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const startOfWeek = new Date(jan4)
  startOfWeek.setUTCDate(jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1 + (week - 1) * 7)
  return startOfWeek
}

export function resumenSemana(compras: Compra[], semana: string, config: Configuracion): ResumenSemana {
  const comprasSemana = compras.filter(c => getSemanaISO(new Date(c.fecha + 'T12:00:00')) === semana)
  return {
    semana,
    totalKilosComprados: comprasSemana.reduce((s, c) => s + c.kilos, 0),
    totalKilosSecos: kilosSecosTotales(comprasSemana, config),
    totalInvertido: totalInvertido(comprasSemana),
    cantidadCompras: comprasSemana.length,
  }
}

export function semanaAnterior(semana: string): string {
  const lunes = getLunesDeSemana(semana)
  lunes.setUTCDate(lunes.getUTCDate() - 7)
  return getSemanaISO(lunes)
}

export function semanaSiguiente(semana: string): string {
  const lunes = getLunesDeSemana(semana)
  lunes.setUTCDate(lunes.getUTCDate() + 7)
  return getSemanaISO(lunes)
}

export function formatSemanaLabel(semana: string): string {
  const lunes = getLunesDeSemana(semana)
  const domingo = new Date(lunes)
  domingo.setUTCDate(lunes.getUTCDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' }
  return `${lunes.toLocaleDateString('es-CO', opts)} – ${domingo.toLocaleDateString('es-CO', opts)}`
}
