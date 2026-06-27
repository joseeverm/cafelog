import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Compra, Configuracion, TipoCafe } from '../types'
import { kilosSecos, totalPagadoCompra, getSemanaISO, resumenSemana } from './calculos'
import { formatPeso, formatNumero, formatFecha } from './formato'

export interface FilaExcel {
  fecha: string
  agricultor: string
  tipoCafeNombre: string
  estado: 'humedo' | 'seco' | 'pasilla'
  kilos: number
  precioPorKilo: number
  costosAdicionales: number
  notas: string
}

const MESES_ES: Record<string, string> = {
  'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
  'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
  'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
}

function parseFechaES(str: string): string {
  const m = String(str).trim().match(/^(\d{1,2})\s+(\w+)\.?\s+(\d{4})$/)
  if (!m) throw new Error(`Fecha no reconocida: "${str}"`)
  const [, dia, mes, año] = m
  const mesNum = MESES_ES[mes.toLowerCase()]
  if (!mesNum) throw new Error(`Mes desconocido: "${mes}"`)
  return `${año}-${mesNum}-${dia.padStart(2, '0')}`
}

export async function parsearExcelImport(file: File): Promise<FilaExcel[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: true })

  if (rows.length === 0) throw new Error('El archivo está vacío')

  const texto = (row: Record<string, unknown>, key: string) =>
    String(row[key] ?? '').trim()

  const numero = (row: Record<string, unknown>, key: string): number => {
    const v = row[key]
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '0').replace(/\./g, '').replace(',', '.'))
    return isNaN(n) ? 0 : n
  }

  const filas: FilaExcel[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const agricultor = texto(row, 'Agricultor')
    const kilos = numero(row, 'Kilos Comprados')
    if (!agricultor || kilos <= 0) continue

    let fecha: string
    try {
      fecha = parseFechaES(texto(row, 'Fecha'))
    } catch (e) {
      throw new Error(`Fila ${i + 2}: ${(e as Error).message}`)
    }

    const estadoRaw = texto(row, 'Estado').toLowerCase()
    filas.push({
      fecha,
      agricultor,
      tipoCafeNombre: texto(row, 'Tipo de Café'),
      estado: estadoRaw.startsWith('pas') ? 'pasilla' : estadoRaw.startsWith('sec') ? 'seco' : 'humedo',
      kilos,
      precioPorKilo: numero(row, 'Precio/Kg'),
      costosAdicionales: numero(row, 'Costos Adicionales'),
      notas: texto(row, 'Notas'),
    })
  }

  if (filas.length === 0) throw new Error('No se encontraron filas válidas en el archivo')
  return filas
}

function getTipoCafe(tipoId: string, tipos: TipoCafe[]): string {
  return tipos.find(t => t.id === tipoId)?.nombre ?? 'Desconocido'
}

export function exportarExcel(compras: Compra[], config: Configuracion): void {
  const filas = compras.map(c => ({
    Fecha: formatFecha(c.fecha),
    Agricultor: c.agricultor,
    'Tipo de Café': getTipoCafe(c.tipoCafeId, config.tiposCafe),
    Estado: c.estado === 'humedo' ? 'Húmedo' : c.estado === 'pasilla' ? 'Pasilla' : 'Seco',
    'Kilos Comprados': c.kilos,
    'Precio/Kg': c.precioPorKilo,
    'Kilos Secos Est.': Number(kilosSecos(c.kilos, c.estado, config.porcentajePerdidaSecado).toFixed(2)),
    'Total Pagado': totalPagadoCompra(c),
    'Costos Adicionales': c.costosAdicionales.reduce((s, ca) => s + ca.monto, 0),
    Notas: c.notas,
  }))

  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Compras')

  const numCols = [4, 5, 6, 7, 8]
  filas.forEach((_, i) => {
    numCols.forEach(col => {
      const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: col })
      if (ws[cellRef]) ws[cellRef].t = 'n'
    })
  })

  XLSX.writeFile(wb, `cafelog-compras-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarPDF(compras: Compra[], config: Configuracion): void {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(18)
  doc.setTextColor(90, 50, 20)
  doc.text('CaféLog — Resumen de Compras', 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 23)

  const semanas = [...new Set(compras.map(c => getSemanaISO(new Date(c.fecha + 'T12:00:00'))))].sort()

  let yPos = 32

  for (const semana of semanas) {
    const resumen = resumenSemana(compras, semana, config)
    const comprasSemana = compras.filter(c => getSemanaISO(new Date(c.fecha + 'T12:00:00')) === semana)

    doc.setFontSize(12)
    doc.setTextColor(90, 50, 20)
    doc.text(`Semana ${semana}`, 14, yPos)
    yPos += 5

    const filas = comprasSemana.map(c => [
      formatFecha(c.fecha),
      c.agricultor,
      getTipoCafe(c.tipoCafeId, config.tiposCafe),
      c.estado === 'humedo' ? 'Húmedo' : c.estado === 'pasilla' ? 'Pasilla' : 'Seco',
      `${formatNumero(c.kilos)} kg`,
      formatPeso(c.precioPorKilo),
      `${formatNumero(kilosSecos(c.kilos, c.estado, config.porcentajePerdidaSecado))} kg`,
      formatPeso(totalPagadoCompra(c)),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Agricultor', 'Tipo', 'Estado', 'Kilos', 'Precio/Kg', 'Kilos Secos', 'Total']],
      body: filas,
      foot: [[
        '', '', '', 'TOTAL SEMANA',
        `${formatNumero(resumen.totalKilosComprados)} kg`, '',
        `${formatNumero(resumen.totalKilosSecos)} kg`,
        formatPeso(resumen.totalInvertido),
      ]],
      theme: 'striped',
      headStyles: { fillColor: [90, 50, 20] },
      footStyles: { fillColor: [200, 170, 120], textColor: [50, 25, 5], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    if (yPos > 180) {
      doc.addPage()
      yPos = 16
    }
  }

  doc.save(`cafelog-resumen-${new Date().toISOString().split('T')[0]}.pdf`)
}
