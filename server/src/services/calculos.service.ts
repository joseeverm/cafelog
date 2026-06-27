import { CostoAdicional } from '../types'

export function kilosSecos(kilos: number, estado: 'humedo' | 'seco', porcentajePerdida: number): number {
  return estado === 'seco' ? kilos : kilos * (1 - porcentajePerdida / 100)
}

export function totalPagadoCompra(
  kilos: number,
  precioPorKilo: number,
  costosAdicionales: CostoAdicional[],
): number {
  return kilos * precioPorKilo + costosAdicionales.reduce((sum, c) => sum + c.monto, 0)
}

export function getSemanaISO(fecha: string): string {
  const d = new Date(Date.UTC(...parseDate(fecha)))
  const dayOfWeek = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

export function semanaAFechas(semana: string): { inicio: string; fin: string } {
  const [yearStr, weekStr] = semana.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const lunes = new Date(jan4)
  lunes.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1)

  const inicio = new Date(lunes)
  inicio.setUTCDate(lunes.getUTCDate() + (week - 1) * 7)

  const fin = new Date(inicio)
  fin.setUTCDate(inicio.getUTCDate() + 6)

  return {
    inicio: inicio.toISOString().slice(0, 10),
    fin: fin.toISOString().slice(0, 10),
  }
}

function parseDate(fecha: string): [number, number, number] {
  const [y, m, d] = fecha.split('-').map(Number)
  return [y, m - 1, d]
}
