import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Compra, Lote, Configuracion, TipoCafe, CostoAdicional } from '../types'
import {
  apiGetCompras, apiCrearCompra, apiEditarCompra, apiEliminarCompra,
  apiGetLotes, apiCrearLote, apiEditarLote, apiVenderLote, apiActualizarComprasLote, apiEliminarLote,
  apiGetConfiguracion, apiUpdateConfiguracion,
  apiCrearTipoCafe, apiEditarTipoCafe, apiEliminarTipoCafe,
  apiImportar,
} from '../api/client'
import type { FilaExcel } from '../utils/exportar'
import { generarId } from '../utils/formato'

interface AppContextType {
  compras: Compra[]
  lotes: Lote[]
  config: Configuracion
  loading: boolean

  agregarCompra: (compra: Omit<Compra, 'id'>) => Promise<string>
  editarCompra: (id: string, datos: Partial<Compra>) => Promise<void>
  eliminarCompra: (id: string) => Promise<void>

  agregarLote: (lote: Omit<Lote, 'id'>) => Promise<string>
  editarLote: (id: string, datos: Partial<Lote>) => Promise<void>
  eliminarLote: (id: string) => Promise<void>

  setConfig: (config: Configuracion) => Promise<void>
  agregarTipoCafe: (tipo: Omit<TipoCafe, 'id'>) => Promise<void>
  editarTipoCafe: (id: string, datos: Partial<TipoCafe>) => Promise<void>
  eliminarTipoCafe: (id: string) => Promise<void>

  migrarDesdeLocalStorage: () => Promise<{ tiposCafe: number; lotes: number; compras: number }>
  importarComprasDesdeExcel: (filas: FilaExcel[]) => Promise<{ importadas: number; tiposCreados: number }>
}

const CONFIG_VACIA: Configuracion = {
  porcentajePerdidaSecado: 50,
  tiposCafe: [],
  costosFrecuentes: [],
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [compras, setCompras] = useState<Compra[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [config, setConfigState] = useState<Configuracion>(CONFIG_VACIA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGetCompras(), apiGetLotes(), apiGetConfiguracion()])
      .then(([c, l, cfg]) => {
        setCompras(c)
        setLotes(l)
        setConfigState(cfg)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Compras ────────────────────────────────────────────────────────────────

  async function agregarCompra(datos: Omit<Compra, 'id'>): Promise<string> {
    const nueva = await apiCrearCompra(datos)
    setCompras(prev => [nueva, ...prev])
    if (datos.loteId) {
      setLotes(prev => prev.map(l =>
        l.id === datos.loteId ? { ...l, compraIds: [...l.compraIds, nueva.id] } : l,
      ))
    }
    return nueva.id
  }

  async function editarCompra(id: string, datos: Partial<Compra>): Promise<void> {
    const compraAnterior = compras.find(c => c.id === id)
    if (!compraAnterior) return
    const compraCompleta = { ...compraAnterior, ...datos } as Omit<Compra, 'id'>
    const actualizada = await apiEditarCompra(id, compraCompleta)
    setCompras(prev => prev.map(c => c.id === id ? actualizada : c))

    if (datos.loteId !== undefined && datos.loteId !== compraAnterior.loteId) {
      setLotes(prev => prev.map(l => {
        if (l.id === compraAnterior.loteId) return { ...l, compraIds: l.compraIds.filter(cId => cId !== id) }
        if (l.id === datos.loteId) return { ...l, compraIds: [...l.compraIds, id] }
        return l
      }))
    }
  }

  async function eliminarCompra(id: string): Promise<void> {
    const compra = compras.find(c => c.id === id)
    await apiEliminarCompra(id)
    setCompras(prev => prev.filter(c => c.id !== id))
    if (compra?.loteId) {
      setLotes(prev => prev.map(l =>
        l.id === compra.loteId ? { ...l, compraIds: l.compraIds.filter(cId => cId !== id) } : l,
      ))
    }
  }

  // ── Lotes ──────────────────────────────────────────────────────────────────

  async function agregarLote(datos: Omit<Lote, 'id'>): Promise<string> {
    const nuevo = await apiCrearLote({ nombre: datos.nombre, fechaCreacion: datos.fechaCreacion })
    setLotes(prev => [nuevo, ...prev])
    return nuevo.id
  }

  async function editarLote(id: string, datos: Partial<Lote>): Promise<void> {
    if (datos.estado === 'vendido' && datos.precioVentaPorKilo != null) {
      const actualizado = await apiVenderLote(id, datos.precioVentaPorKilo)
      setLotes(prev => prev.map(l => l.id === id ? actualizado : l))
      return
    }

    if (datos.compraIds !== undefined) {
      const actualizado = await apiActualizarComprasLote(id, datos.compraIds)
      setLotes(prev => prev.map(l => l.id === id ? actualizado : l))
      // Sync compras: update their loteId to match the new assignment
      const nuevosIds = new Set(datos.compraIds)
      setCompras(prev => prev.map(c => {
        if (c.loteId === id && !nuevosIds.has(c.id)) return { ...c, loteId: undefined }
        if (nuevosIds.has(c.id) && c.loteId !== id) return { ...c, loteId: id }
        return c
      }))
      return
    }

    const actualizado = await apiEditarLote(id, {
      nombre: datos.nombre,
      gastosAdicionales: datos.gastosAdicionales as CostoAdicional[] | undefined,
    })
    setLotes(prev => prev.map(l => l.id === id ? actualizado : l))
  }

  async function eliminarLote(id: string): Promise<void> {
    await apiEliminarLote(id)
    setLotes(prev => prev.filter(l => l.id !== id))
    setCompras(prev => prev.map(c => c.loteId === id ? { ...c, loteId: undefined } : c))
  }

  // ── Configuración ──────────────────────────────────────────────────────────

  async function setConfig(nueva: Configuracion): Promise<void> {
    const actualizada = await apiUpdateConfiguracion({
      porcentajePerdidaSecado: nueva.porcentajePerdidaSecado,
      costosFrecuentes: nueva.costosFrecuentes,
    })
    setConfigState(actualizada)
  }

  async function agregarTipoCafe(tipo: Omit<TipoCafe, 'id'>): Promise<void> {
    const nuevo = await apiCrearTipoCafe(tipo)
    setConfigState(prev => ({ ...prev, tiposCafe: [...prev.tiposCafe, nuevo] }))
  }

  async function editarTipoCafe(id: string, datos: Partial<TipoCafe>): Promise<void> {
    const tipo = config.tiposCafe.find(t => t.id === id)
    if (!tipo) return
    const actualizado = await apiEditarTipoCafe(id, {
      nombre: datos.nombre ?? tipo.nombre,
      color: datos.color ?? tipo.color,
    })
    setConfigState(prev => ({
      ...prev,
      tiposCafe: prev.tiposCafe.map(t => t.id === id ? actualizado : t),
    }))
  }

  async function eliminarTipoCafe(id: string): Promise<void> {
    await apiEliminarTipoCafe(id)
    setConfigState(prev => ({ ...prev, tiposCafe: prev.tiposCafe.filter(t => t.id !== id) }))
  }

  // ── Importar desde Excel ───────────────────────────────────────────────────

  async function importarComprasDesdeExcel(filas: FilaExcel[]) {
    // Build tipo map: nombre (lowercase) → id
    const tipoMap = new Map(config.tiposCafe.map(t => [t.nombre.toLowerCase(), t.id]))
    let tiposCreados = 0

    // Create missing tipos
    const nombresNecesarios = [...new Set(filas.map(f => f.tipoCafeNombre).filter(Boolean))]
    for (const nombre of nombresNecesarios) {
      if (!tipoMap.has(nombre.toLowerCase())) {
        const nuevo = await apiCrearTipoCafe({ nombre, color: '#b8833a' })
        tipoMap.set(nombre.toLowerCase(), nuevo.id)
        setConfigState(prev => ({ ...prev, tiposCafe: [...prev.tiposCafe, nuevo] }))
        tiposCreados++
      }
    }

    // Create compras sequentially
    for (const fila of filas) {
      const tipoCafeId = tipoMap.get(fila.tipoCafeNombre.toLowerCase()) ?? config.tiposCafe[0]?.id ?? ''
      const costosAdicionales: CostoAdicional[] = fila.costosAdicionales > 0
        ? [{ id: generarId(), descripcion: 'Costos importados', monto: fila.costosAdicionales }]
        : []
      const nueva = await apiCrearCompra({
        fecha: fila.fecha,
        agricultor: fila.agricultor,
        tipoCafeId,
        estado: fila.estado,
        kilos: fila.kilos,
        precioPorKilo: fila.precioPorKilo,
        costosAdicionales,
        notas: fila.notas,
      })
      setCompras(prev => [nueva, ...prev])
    }

    return { importadas: filas.length, tiposCreados }
  }

  // ── Migración desde localStorage ───────────────────────────────────────────

  async function migrarDesdeLocalStorage() {
    const rawCompras = localStorage.getItem('cafelog_compras')
    const rawLotes = localStorage.getItem('cafelog_lotes')
    const rawConfig = localStorage.getItem('cafelog_config')

    const comprasLS: Compra[] = rawCompras ? (JSON.parse(rawCompras) as Compra[]) : []
    const lotesLS: Lote[] = rawLotes ? (JSON.parse(rawLotes) as Lote[]) : []
    const configLS: Configuracion = rawConfig ? (JSON.parse(rawConfig) as Configuracion) : CONFIG_VACIA

    const resultado = await apiImportar({ compras: comprasLS, lotes: lotesLS, config: configLS })

    // Reload data from server
    const [c, l, cfg] = await Promise.all([apiGetCompras(), apiGetLotes(), apiGetConfiguracion()])
    setCompras(c)
    setLotes(l)
    setConfigState(cfg)

    localStorage.setItem('cafelog_migrated', '1')
    return resultado.importado
  }

  return (
    <AppContext.Provider value={{
      compras, lotes, config, loading,
      agregarCompra, editarCompra, eliminarCompra,
      agregarLote, editarLote, eliminarLote,
      setConfig, agregarTipoCafe, editarTipoCafe, eliminarTipoCafe,
      migrarDesdeLocalStorage, importarComprasDesdeExcel,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
