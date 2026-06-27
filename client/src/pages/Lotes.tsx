import { useState } from 'react'
import { Package, Check, X, Banknote, MousePointerClick } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Lote, Compra, CostoAdicional, Configuracion } from '../types'
import { kilosSecosTotales, totalInvertido, totalGastosLote, gananciaLote } from '../utils/calculos'
import { formatPeso, formatNumero, formatFecha, hoy, generarId } from '../utils/formato'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'
import BadgeEstado from '../components/BadgeEstado'
import Modal from '../components/Modal'
import EstadoVacio from '../components/EstadoVacio'
import InputMoneda from '../components/InputMoneda'

const inputCls =
  'w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors'

export default function Lotes() {
  const { lotes, compras, config, agregarLote, editarLote, eliminarLote } = useApp()
  const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [modalVender, setModalVender] = useState<Lote | null>(null)

  function comprasDelLote(lote: Lote): Compra[] {
    return compras.filter(c => lote.compraIds.includes(c.id))
  }

  function getTipoCafe(id: string) {
    return config.tiposCafe.find(t => t.id === id)
  }

  function crearLote() {
    if (!nombreNuevo.trim()) return
    agregarLote({ nombre: nombreNuevo.trim(), fechaCreacion: hoy(), compraIds: [], estado: 'abierto', gastosAdicionales: [] })
    setNombreNuevo('')
    setModalNuevo(false)
  }

  function marcarVendido() {
    if (!modalVender) return
    const precio = parseFloat(precioVenta)
    if (!precio || precio <= 0) return
    editarLote(modalVender.id, { estado: 'vendido', precioVentaPorKilo: precio })
    setModalVender(null)
    setPrecioVenta('')
  }

  const lotesOrdenados = [...lotes].sort((a, b) => {
    if (a.estado === 'abierto' && b.estado === 'vendido') return -1
    if (a.estado === 'vendido' && b.estado === 'abierto') return 1
    return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  })

  const loteActivo = loteSeleccionado
    ? (lotes.find(l => l.id === loteSeleccionado.id) ?? loteSeleccionado)
    : null

  return (
    <div>
      <PageHeader
        titulo="Mis Lotes"
        subtitulo="Agrupa compras en lotes de secado y venta"
        accion={<Boton variante="primario" onClick={() => setModalNuevo(true)}>+ Nuevo Lote</Boton>}
      />

      <div className="p-4 md:p-8">
        {lotes.length === 0 ? (
          <EstadoVacio
            icon={Package}
            mensaje="No tienes lotes creados"
            submensaje="Crea un lote para agrupar compras y calcular ganancias al momento de vender"
            accion={<Boton variante="primario" onClick={() => setModalNuevo(true)}>Crear primer lote</Boton>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de lotes */}
            <div className="lg:col-span-1 space-y-2">
              {lotesOrdenados.map(lote => {
                const cs = comprasDelLote(lote)
                const secos = kilosSecosTotales(cs, config)
                const invertido = totalInvertido(cs) + totalGastosLote(lote)
                const seleccionado = loteSeleccionado?.id === lote.id

                return (
                  <button
                    key={lote.id}
                    onClick={() => setLoteSeleccionado(lote)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      seleccionado
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{lote.nombre}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{formatFecha(lote.fechaCreacion)}</p>
                      </div>
                      <BadgeEstado estado={lote.estado} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Compras</p>
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{cs.length}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Kg secos</p>
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{formatNumero(secos)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 dark:text-zinc-500">Costo</p>
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{formatPeso(invertido)}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detalle */}
            <div className="lg:col-span-2">
              {!loteActivo ? (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-60">
                      <MousePointerClick className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecciona un lote para ver el detalle</p>
                  </div>
                </div>
              ) : (
                <DetalleLote
                  lote={loteActivo}
                  comprasDelLote={comprasDelLote(loteActivo)}
                  config={config}
                  getTipoCafe={getTipoCafe}
                  onActualizarGastos={gastos => editarLote(loteActivo.id, { gastosAdicionales: gastos })}
                  onMarcarVendido={() => setModalVender(loteActivo)}
                  onEliminar={() => { eliminarLote(loteActivo.id); setLoteSeleccionado(null) }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal nuevo lote */}
      <Modal titulo="Nuevo Lote" abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} tamaño="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nombre del lote</label>
            <input
              type="text"
              placeholder="Ej: Lote Junio #2"
              value={nombreNuevo}
              onChange={e => setNombreNuevo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && crearLote()}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <Boton variante="secundario" className="flex-1" onClick={() => setModalNuevo(false)}>Cancelar</Boton>
            <Boton variante="primario" className="flex-1" onClick={crearLote} disabled={!nombreNuevo.trim()}>Crear</Boton>
          </div>
        </div>
      </Modal>

      {/* Modal vender */}
      <Modal titulo="Marcar como Vendido" abierto={!!modalVender} onCerrar={() => setModalVender(null)} tamaño="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ingresa el precio de venta para calcular la ganancia de{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">{modalVender?.nombre}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Precio de venta por kilo ($)</label>
            <InputMoneda value={precioVenta} onChange={v => setPrecioVenta(v)} className={inputCls} />
          </div>
          {modalVender && precioVenta && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Ganancia estimada:{' '}
                {formatPeso(
                  kilosSecosTotales(comprasDelLote(modalVender), config) * parseFloat(precioVenta) -
                  totalInvertido(comprasDelLote(modalVender)) -
                  totalGastosLote(modalVender)
                )}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Boton variante="secundario" className="flex-1" onClick={() => setModalVender(null)}>Cancelar</Boton>
            <Boton variante="primario" className="flex-1" onClick={marcarVendido}
              disabled={!precioVenta || parseFloat(precioVenta) <= 0}>
              Confirmar Venta
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Detalle de lote ──────────────────────────────────────────────────────────

interface DetalleLoteProps {
  lote: Lote
  comprasDelLote: Compra[]
  config: Configuracion
  getTipoCafe: (id: string) => { id: string; nombre: string; color: string } | undefined
  onActualizarGastos: (gastos: CostoAdicional[]) => void
  onMarcarVendido: () => void
  onEliminar: () => void
}

const fieldCls =
  'px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors'

function DetalleLote({ lote, comprasDelLote, config, getTipoCafe, onActualizarGastos, onMarcarVendido, onEliminar }: DetalleLoteProps) {
  const gastos = lote.gastosAdicionales ?? []
  const secos = kilosSecosTotales(comprasDelLote, config)
  const costoCompras = totalInvertido(comprasDelLote)
  const costoGastos = totalGastosLote(lote)
  const costoTotal = costoCompras + costoGastos
  const ganancia = gananciaLote(lote, comprasDelLote, config)

  const [nuevoDesc, setNuevoDesc] = useState('')
  const [nuevoMonto, setNuevoMonto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editMonto, setEditMonto] = useState('')

  function agregarGasto() {
    const monto = parseFloat(nuevoMonto)
    if (!nuevoDesc.trim() || !monto) return
    onActualizarGastos([...gastos, { id: generarId(), descripcion: nuevoDesc.trim(), monto }])
    setNuevoDesc('')
    setNuevoMonto('')
  }

  function iniciarEdicion(g: CostoAdicional) {
    setEditandoId(g.id)
    setEditDesc(g.descripcion)
    setEditMonto(g.monto.toString())
  }

  function guardarEdicion() {
    const monto = parseFloat(editMonto)
    if (!editDesc.trim() || !monto) return
    onActualizarGastos(gastos.map(g => g.id === editandoId ? { ...g, descripcion: editDesc.trim(), monto } : g))
    setEditandoId(null)
  }

  function eliminarGasto(id: string) {
    onActualizarGastos(gastos.filter(g => g.id !== id))
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{lote.nombre}</h2>
          <div className="flex items-center gap-2 mt-1">
            <BadgeEstado estado={lote.estado} />
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatFecha(lote.fechaCreacion)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {lote.estado === 'abierto' && (
            <Boton variante="primario" tamaño="sm" onClick={onMarcarVendido}>Marcar vendido</Boton>
          )}
          <Boton variante="peligro" tamaño="sm" onClick={onEliminar}>Eliminar</Boton>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { label: 'Compras', valor: comprasDelLote.length.toString(), pos: null },
          { label: 'Kg secos', valor: `${formatNumero(secos)} kg`, pos: null },
          { label: 'Costo total', valor: formatPeso(costoTotal), pos: null },
          {
            label: lote.precioVentaPorKilo ? 'Ganancia' : 'Precio venta',
            valor: lote.precioVentaPorKilo ? formatPeso(ganancia ?? 0) : '—',
            pos: ganancia != null ? ganancia >= 0 : null,
          },
        ].map(m => (
          <div key={m.label} className="p-3 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{m.label}</p>
            <p className={`font-bold text-sm mt-0.5 ${
              m.pos === true ? 'text-emerald-600 dark:text-emerald-400' :
              m.pos === false ? 'text-red-500 dark:text-red-400' :
              'text-zinc-900 dark:text-zinc-100'
            }`}>{m.valor}</p>
          </div>
        ))}
      </div>

      {/* Compras del lote */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <p className="px-5 pt-3 pb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Compras ({comprasDelLote.length})
        </p>
        {comprasDelLote.length === 0 ? (
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm py-6">Sin compras asignadas</p>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {comprasDelLote.map(c => {
              const tipo = getTipoCafe(c.tipoCafeId)
              return (
                <div key={c.id} className="flex items-center px-5 py-3 gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tipo?.color ?? '#a1a1aa' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.agricultor}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatFecha(c.fecha)} · {tipo?.nombre} · {formatNumero(c.kilos)} kg
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatPeso(c.kilos * c.precioPorKilo + c.costosAdicionales.reduce((s, ca) => s + ca.monto, 0))}
                    </p>
                    <BadgeEstado estado={c.estado} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Gastos del lote */}
      <div>
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Gastos del lote
          </p>
          {costoGastos > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              — {formatPeso(costoGastos)}
            </span>
          )}
        </div>

        {gastos.length === 0 && (
          <p className="px-5 pb-3 text-sm text-zinc-400 dark:text-zinc-500">
            Sin gastos. Agrega secado, transporte, empaque, etc.
          </p>
        )}

        {gastos.length > 0 && (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 mb-3">
            {gastos.map(g => (
              <div key={g.id} className="px-5 py-2.5">
                {editandoId === g.id ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      placeholder="Descripción" className={`${fieldCls} flex-1`} />
                    <div className="flex gap-2">
                      <InputMoneda value={editMonto} onChange={v => setEditMonto(v)}
                        className={`${fieldCls} flex-1 sm:w-28 sm:flex-none`} />
                      <button onClick={guardarEdicion}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditandoId(null)}
                        className="px-3 py-1.5 text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <Banknote className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{g.descripcion}</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatPeso(g.monto)}</span>
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => iniciarEdicion(g)}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md transition-colors">
                        Editar
                      </button>
                      <button onClick={() => eliminarGasto(g.id)}
                        className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-0.5 border border-red-200 dark:border-red-500/30 rounded-md transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario agregar gasto */}
        <div className="px-5 pb-5">
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2">Agregar gasto</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Descripción (ej: Secado, Flete...)" value={nuevoDesc}
              onChange={e => setNuevoDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarGasto()}
              className={`${fieldCls} flex-1 w-full`} />
            <div className="flex gap-2">
              <InputMoneda value={nuevoMonto} onChange={v => setNuevoMonto(v)}
                placeholder="Monto"
                className={`${fieldCls} flex-1 sm:w-32 sm:flex-none`} />
              <Boton variante="primario" tamaño="sm" onClick={agregarGasto}
                disabled={!nuevoDesc.trim() || !nuevoMonto}>
                Agregar
              </Boton>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen financiero */}
      {lote.precioVentaPorKilo && (
        <div className={`mx-4 mb-4 rounded-xl p-4 text-sm border ${
          ganancia != null && ganancia >= 0
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-300'
        }`}>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-sm">Ingresos ({formatNumero(secos)} kg × {formatPeso(lote.precioVentaPorKilo)})</span>
              <span className="font-semibold tabular-nums">{formatPeso(secos * lote.precioVentaPorKilo)}</span>
            </div>
            <div className="flex justify-between opacity-70 text-xs">
              <span>Costo compras</span>
              <span className="tabular-nums">− {formatPeso(costoCompras)}</span>
            </div>
            {costoGastos > 0 && (
              <div className="flex justify-between opacity-70 text-xs">
                <span>Gastos del lote</span>
                <span className="tabular-nums">− {formatPeso(costoGastos)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1.5 border-t border-current/20">
              <span>Ganancia neta</span>
              <span className="tabular-nums">{formatPeso(ganancia ?? 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
