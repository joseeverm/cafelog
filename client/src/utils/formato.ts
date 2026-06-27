export function formatPeso(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatNumero(valor: number, decimales = 2): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(valor)
}

export function formatFecha(fechaStr: string): string {
  const d = new Date(fechaStr + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
