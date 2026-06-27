import { useState, useMemo } from 'react'
import { FileSpreadsheet, FileText, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  kilosSecos, totalPagadoCompra, getSemanaActual,
  semanaAnterior, semanaSiguiente, formatSemanaLabel, getSemanaISO,
} from '../utils/calculos'
import { formatPeso, formatNumero, formatFecha } from '../utils/formato'
import { exportarExcel, exportarPDF } from '../utils/exportar'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'
import BadgeEstado from '../components/BadgeEstado'
import EstadoVacio from '../components/EstadoVacio'
import Modal from '../components/Modal'
import FormularioCompra from '../components/FormularioCompra'
import type { Compra } from '../types'

const selectCls =
  'text-sm px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors'

export default function Historial() {
  const { compras, lotes, config, editarCompra, eliminarCompra } = useApp()
  const [filtraSemana, setFiltraSemana] = useState<string>('')
  const [selectorSemana, setSelectorSemana] = useState(getSemanaActual())
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroAgricultor, setFiltroAgricultor] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [compraEditando, setCompraEditando] = useState<Compra | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  const agricultores = useMemo(() => [...new Set(compras.map(c => c.agricultor))].sort(), [compras])

  const comprasFiltradas = useMemo(() => compras.filter(c => {
    if (filtraSemana && getSemanaISO(new Date(c.fecha + 'T12:00:00')) !== filtraSemana) return false
    if (filtroTipo && c.tipoCafeId !== filtroTipo) return false
    if (filtroAgricultor && c.agricultor !== filtroAgricultor) return false
    if (filtroEstado && c.estado !== filtroEstado) return false
    return true
  }), [compras, filtraSemana, filtroTipo, filtroAgricultor, filtroEstado])

  const getLote = (id?: string) => lotes.find(l => l.id === id)
  const getTipoCafe = (id: string) => config.tiposCafe.find(t => t.id === id)

  function toggleSemana() {
    setFiltraSemana(prev => (prev === selectorSemana ? '' : selectorSemana))
  }

  function handleEditar(datos: Omit<Compra, 'id'>) {
    if (!compraEditando) return
    editarCompra(compraEditando.id, datos)
    setCompraEditando(null)
  }

  function handleEliminar(id: string) {
    eliminarCompra(id)
    setConfirmEliminar(null)
  }

  const hayFiltros = filtraSemana || filtroTipo || filtroAgricultor || filtroEstado

  return (
    <div>
      <PageHeader
        titulo="Historial"
        subtitulo={`${comprasFiltradas.length} compra${comprasFiltradas.length !== 1 ? 's' : ''}${hayFiltros ? ' (filtrado)' : ''}`}
        accion={
          <div className="flex gap-2">
            <Boton variante="secundario" tamaño="sm" onClick={() => exportarExcel(comprasFiltradas, config)}>
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Boton>
            <Boton variante="secundario" tamaño="sm" onClick={() => exportarPDF(comprasFiltradas, config)}>
              <FileText className="w-4 h-4" />
              PDF
            </Boton>
          </div>
        }
      />

      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-4 md:px-8 py-3 space-y-3">
        {/* Selector semana */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectorSemana(semanaAnterior(selectorSemana))}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSemana}
            className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-all ${
              filtraSemana === selectorSemana
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            {formatSemanaLabel(selectorSemana)}
          </button>
          <button
            onClick={() => setSelectorSemana(semanaSiguiente(selectorSemana))}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {filtraSemana && (
            <button onClick={() => setFiltraSemana('')}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1">
              <X className="w-3 h-3" /> quitar filtro
            </button>
          )}
        </div>

        {/* Otros filtros */}
        <div className="flex flex-wrap gap-2">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={selectCls}>
            <option value="">Todos los tipos</option>
            {config.tiposCafe.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <select value={filtroAgricultor} onChange={e => setFiltroAgricultor(e.target.value)} className={selectCls}>
            <option value="">Todos los agricultores</option>
            {agricultores.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={selectCls}>
            <option value="">Todos los estados</option>
            <option value="humedo">Húmedo</option>
            <option value="seco">Seco</option>
          </select>
          {hayFiltros && (
            <button
              onClick={() => { setFiltraSemana(''); setFiltroTipo(''); setFiltroAgricultor(''); setFiltroEstado('') }}
              className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 md:p-8">
        {comprasFiltradas.length === 0 ? (
          <EstadoVacio icon={Search} mensaje="No hay compras con estos filtros"
            submensaje="Intenta cambiar o limpiar los filtros" />
        ) : (
          <>
            {/* Móvil: cards */}
            <div className="sm:hidden space-y-3">
              {comprasFiltradas.map(compra => {
                const tipo = getTipoCafe(compra.tipoCafeId)
                const lote = getLote(compra.loteId)
                return (
                  <div key={compra.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{compra.agricultor}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{formatFecha(compra.fecha)}</p>
                      </div>
                      <BadgeEstado estado={compra.estado} />
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tipo?.color ?? '#a1a1aa' }} />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{tipo?.nombre}</span>
                      {lote && <span className="text-xs text-zinc-400 dark:text-zinc-500">· {lote.nombre}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Kilos</p>
                        <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{formatNumero(compra.kilos)} kg</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Kg secos</p>
                        <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                          {formatNumero(kilosSecos(compra.kilos, compra.estado, config.porcentajePerdidaSecado))} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Total</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                          {formatPeso(totalPagadoCompra(compra))}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 justify-end border-t border-zinc-200 dark:border-zinc-800 pt-3">
                      <button onClick={() => setCompraEditando(compra)}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors">
                        Editar
                      </button>
                      <button onClick={() => setConfirmEliminar(compra.id)}
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 px-2.5 py-1 border border-red-200 dark:border-red-500/30 rounded-lg transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden sm:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-300 dark:border-zinc-800">
                      {['Fecha', 'Agricultor', 'Tipo', 'Estado', 'Kilos', 'Precio/kg', 'Kg secos', 'Total', 'Lote', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {comprasFiltradas.map(compra => {
                      const tipo = getTipoCafe(compra.tipoCafeId)
                      const lote = getLote(compra.loteId)
                      return (
                        <tr key={compra.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                            {formatFecha(compra.fecha)}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{compra.agricultor}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tipo?.color ?? '#a1a1aa' }} />
                              <span className="text-zinc-600 dark:text-zinc-400">{tipo?.nombre ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><BadgeEstado estado={compra.estado} /></td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 tabular-nums">{formatNumero(compra.kilos)} kg</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 tabular-nums">{formatPeso(compra.precioPorKilo)}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 tabular-nums">
                            {formatNumero(kilosSecos(compra.kilos, compra.estado, config.porcentajePerdidaSecado))} kg
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formatPeso(totalPagadoCompra(compra))}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs">{lote?.nombre ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <button onClick={() => setCompraEditando(compra)}
                                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">
                                Editar
                              </button>
                              <button onClick={() => setConfirmEliminar(compra.id)}
                                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/50 border-t-2 border-zinc-200 dark:border-zinc-700 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Total — {comprasFiltradas.length} compras
                      </td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatNumero(comprasFiltradas.reduce((s, c) => s + c.kilos, 0))} kg
                      </td>
                      <td />
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatNumero(comprasFiltradas.reduce((s, c) => s + kilosSecos(c.kilos, c.estado, config.porcentajePerdidaSecado), 0))} kg
                      </td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {formatPeso(comprasFiltradas.reduce((s, c) => s + totalPagadoCompra(c), 0))}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal titulo="Editar Compra" abierto={!!compraEditando} onCerrar={() => setCompraEditando(null)} tamaño="lg">
        {compraEditando && <FormularioCompra compraInicial={compraEditando} onGuardar={handleEditar} />}
      </Modal>

      <Modal titulo="Eliminar Compra" abierto={!!confirmEliminar} onCerrar={() => setConfirmEliminar(null)} tamaño="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ¿Seguro que quieres eliminar esta compra? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <Boton variante="secundario" className="flex-1" onClick={() => setConfirmEliminar(null)}>Cancelar</Boton>
            <Boton variante="peligro" className="flex-1"
              onClick={() => confirmEliminar && handleEliminar(confirmEliminar)}>
              Eliminar
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
