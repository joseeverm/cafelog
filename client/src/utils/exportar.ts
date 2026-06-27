import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Compra, Configuracion, TipoCafe } from '../types'
import { kilosSecos, totalPagadoCompra, getSemanaISO, resumenSemana } from './calculos'
import { formatPeso, formatNumero, formatFecha } from './formato'

function getTipoCafe(tipoId: string, tipos: TipoCafe[]): string {
  return tipos.find(t => t.id === tipoId)?.nombre ?? 'Desconocido'
}

export function exportarExcel(compras: Compra[], config: Configuracion): void {
  const filas = compras.map(c => ({
    Fecha: formatFecha(c.fecha),
    Agricultor: c.agricultor,
    'Tipo de Café': getTipoCafe(c.tipoCafeId, config.tiposCafe),
    Estado: c.estado === 'humedo' ? 'Húmedo' : 'Seco',
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
      c.estado === 'humedo' ? 'Húmedo' : 'Seco',
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
