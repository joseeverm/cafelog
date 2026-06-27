export interface TipoCafe {
  id: string
  nombre: string
  color: string
}

export interface CostoAdicional {
  id: string
  descripcion: string
  monto: number
}

export type EstadoCafe = 'humedo' | 'seco'
export type EstadoLote = 'abierto' | 'vendido'

export interface Compra {
  id: string
  fecha: string
  agricultor: string
  tipoCafeId: string
  estado: EstadoCafe
  kilos: number
  precioPorKilo: number
  costosAdicionales: CostoAdicional[]
  notas: string
  loteId?: string
}

export interface Lote {
  id: string
  nombre: string
  fechaCreacion: string
  compraIds: string[]
  precioVentaPorKilo?: number
  estado: EstadoLote
  gastosAdicionales: CostoAdicional[]
}

export interface Configuracion {
  porcentajePerdidaSecado: number
  tiposCafe: TipoCafe[]
  costosFrecuentes: CostoAdicional[]
}

export interface ResumenSemana {
  semana: string
  totalKilosComprados: number
  totalKilosSecos: number
  totalInvertido: number
  cantidadCompras: number
}
