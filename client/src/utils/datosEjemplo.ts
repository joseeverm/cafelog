import type { Compra, Lote, Configuracion } from '../types'
import { generarId, hoy } from './formato'

function fechaEnSemana(diasAtras: number): string {
  const d = new Date()
  d.setDate(d.getDate() - diasAtras)
  return d.toISOString().split('T')[0]
}

export function generarDatosEjemplo(): { compras: Compra[]; lotes: Lote[]; configuracion: Configuracion } {
  const idPergamino = generarId()
  const idPasilla = generarId()
  const idCereza = generarId()

  const configuracion: Configuracion = {
    porcentajePerdidaSecado: 50,
    tiposCafe: [
      { id: idPergamino, nombre: 'Pergamino', color: '#b8833a' },
      { id: idPasilla, nombre: 'Pasilla', color: '#6a7643' },
      { id: idCereza, nombre: 'Cereza', color: '#c0392b' },
    ],
    costosFrecuentes: [
      { id: generarId(), descripcion: 'Transporte', monto: 15000 },
      { id: generarId(), descripcion: 'Sacos', monto: 3000 },
    ],
  }

  const idLote1 = generarId()

  const compra1Id = generarId()
  const compra2Id = generarId()
  const compra3Id = generarId()
  const compra4Id = generarId()
  const compra5Id = generarId()


  const compras: Compra[] = [
    {
      id: compra1Id,
      fecha: fechaEnSemana(6),
      agricultor: 'Carlos Ramírez',
      tipoCafeId: idPergamino,
      estado: 'humedo',
      kilos: 120,
      precioPorKilo: 3200,
      costosAdicionales: [
        { id: generarId(), descripcion: 'Transporte', monto: 15000 },
      ],
      notas: 'Café de excelente calidad, cosecha temprana',
      loteId: idLote1,
    },
    {
      id: compra2Id,
      fecha: fechaEnSemana(5),
      agricultor: 'María González',
      tipoCafeId: idPasilla,
      estado: 'humedo',
      kilos: 85,
      precioPorKilo: 2800,
      costosAdicionales: [
        { id: generarId(), descripcion: 'Sacos', monto: 3000 },
        { id: generarId(), descripcion: 'Transporte', monto: 15000 },
      ],
      notas: '',
      loteId: idLote1,
    },
    {
      id: compra3Id,
      fecha: fechaEnSemana(4),
      agricultor: 'Pedro Herrera',
      tipoCafeId: idCereza,
      estado: 'humedo',
      kilos: 200,
      precioPorKilo: 2500,
      costosAdicionales: [],
      notas: 'Pagado en efectivo',
      loteId: idLote1,
    },
    {
      id: compra4Id,
      fecha: fechaEnSemana(2),
      agricultor: 'Ana Cortés',
      tipoCafeId: idPergamino,
      estado: 'seco',
      kilos: 60,
      precioPorKilo: 5500,
      costosAdicionales: [
        { id: generarId(), descripcion: 'Transporte', monto: 15000 },
      ],
      notas: 'Café ya secado en parcela',
    },
    {
      id: compra5Id,
      fecha: hoy(),
      agricultor: 'Luis Mora',
      tipoCafeId: idPasilla,
      estado: 'humedo',
      kilos: 150,
      precioPorKilo: 2700,
      costosAdicionales: [
        { id: generarId(), descripcion: 'Sacos', monto: 6000 },
      ],
      notas: '',
    },
  ]

  const lotes: Lote[] = [
    {
      id: idLote1,
      nombre: 'Lote Junio #1',
      fechaCreacion: fechaEnSemana(6),
      compraIds: [compra1Id, compra2Id, compra3Id],
      estado: 'abierto',
      gastosAdicionales: [],
    },
  ]

  return { compras, lotes, configuracion }
}
