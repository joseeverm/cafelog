import { useState } from 'react'
import { Droplets, Sun, ChevronDown, ChevronRight, X, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Compra, CostoAdicional } from '../types'
import { kilosSecos } from '../utils/calculos'
import { formatPeso, formatNumero, hoy, generarId } from '../utils/formato'
import Boton from './Boton'
import InputMoneda from './InputMoneda'

interface Props {
  compraInicial?: Compra
  onGuardar: (compra: Omit<Compra, 'id'>) => void
  onGuardarNueva?: (compra: Omit<Compra, 'id'>) => void
}

const inputCls =
  'w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors'

const labelCls = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5'

function Label({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export default function FormularioCompra({ compraInicial, onGuardar, onGuardarNueva }: Props) {
  const { config, lotes } = useApp()

  const [fecha, setFecha] = useState(compraInicial?.fecha ?? hoy())
  const [agricultor, setAgricultor] = useState(compraInicial?.agricultor ?? '')
  const [tipoCafeId, setTipoCafeId] = useState(compraInicial?.tipoCafeId ?? config.tiposCafe[0]?.id ?? '')
  const [estado, setEstado] = useState<'humedo' | 'seco'>(compraInicial?.estado ?? 'humedo')
  const [kilos, setKilos] = useState(compraInicial?.kilos?.toString() ?? '')
  const [precio, setPrecio] = useState(compraInicial?.precioPorKilo?.toString() ?? '')
  const [costos, setCostos] = useState<CostoAdicional[]>(compraInicial?.costosAdicionales ?? [])
  const [notas, setNotas] = useState(compraInicial?.notas ?? '')
  const [loteId, setLoteId] = useState(compraInicial?.loteId ?? '')
  const [expandirCostos, setExpandirCostos] = useState(costos.length > 0)

  const lotesAbiertos = lotes.filter(l => l.estado === 'abierto')
  const kilosNum = parseFloat(kilos) || 0
  const precioNum = parseFloat(precio) || 0
  const kilosSecosEst = kilosSecos(kilosNum, estado, config.porcentajePerdidaSecado)
  const totalCostos = costos.reduce((s, c) => s + c.monto, 0)
  const totalPagado = kilosNum * precioNum + totalCostos

  function agregarCosto() {
    setCostos(prev => [...prev, { id: generarId(), descripcion: '', monto: 0 }])
  }

  function agregarCostoFrecuente(costo: CostoAdicional) {
    setCostos(prev => [...prev, { ...costo, id: generarId() }])
  }

  function actualizarCosto(id: string, campo: 'descripcion' | 'monto', valor: string) {
    setCostos(prev =>
      prev.map(c =>
        c.id === id ? { ...c, [campo]: campo === 'monto' ? parseFloat(valor) || 0 : valor } : c
      )
    )
  }

  function eliminarCosto(id: string) {
    setCostos(prev => prev.filter(c => c.id !== id))
  }

  function construirCompra(): Omit<Compra, 'id'> {
    return {
      fecha,
      agricultor: agricultor.trim(),
      tipoCafeId,
      estado,
      kilos: kilosNum,
      precioPorKilo: precioNum,
      costosAdicionales: costos,
      notas: notas.trim(),
      loteId: loteId || undefined,
    }
  }

  const formularioValido = fecha && agricultor.trim() && tipoCafeId && kilosNum > 0 && precioNum > 0

  return (
    <div className="space-y-5">
      {/* Fecha y Agricultor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div>
          <Label>Agricultor</Label>
          <Input
            type="text"
            placeholder="Nombre del agricultor"
            value={agricultor}
            onChange={e => setAgricultor(e.target.value)}
          />
        </div>
      </div>

      {/* Tipo de café */}
      <div>
        <Label>Tipo de café</Label>
        <div className="flex flex-wrap gap-2">
          {config.tiposCafe.map(tipo => (
            <button
              key={tipo.id}
              type="button"
              onClick={() => setTipoCafeId(tipo.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                tipoCafeId === tipo.id
                  ? 'shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
              style={
                tipoCafeId === tipo.id
                  ? { backgroundColor: tipo.color + '22', borderColor: tipo.color, color: tipo.color }
                  : {}
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tipo.color }} />
              {tipo.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div>
        <Label>Estado del café</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEstado('humedo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${
              estado === 'humedo'
                ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500 dark:text-blue-400'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Húmedo
          </button>
          <button
            type="button"
            onClick={() => setEstado('seco')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${
              estado === 'seco'
                ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-400'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <Sun className="w-4 h-4" />
            Seco
          </button>
        </div>
      </div>

      {/* Kilos y precio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kilos comprados</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={kilos}
            onChange={e => setKilos(e.target.value)}
          />
        </div>
        <div>
          <Label>Precio por kilo ($)</Label>
          <InputMoneda
            value={precio}
            onChange={v => setPrecio(v)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Preview en tiempo real */}
      {(kilosNum > 0 || precioNum > 0) && (
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-3">
            Vista previa
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Kilos secos estimados</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatNumero(kilosSecosEst)} kg
              </p>
              {estado === 'humedo' && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  ({config.porcentajePerdidaSecado}% pérdida)
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total a pagar</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatPeso(totalPagado)}
              </p>
              {totalCostos > 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  incl. {formatPeso(totalCostos)} en costos
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Costos adicionales */}
      <div>
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          onClick={() => setExpandirCostos(!expandirCostos)}
        >
          {expandirCostos
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />
          }
          Costos adicionales
          {costos.length > 0 && (
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-1.5 py-0.5 rounded-full">
              {costos.length}
            </span>
          )}
        </button>

        {expandirCostos && (
          <div className="mt-3 space-y-3">
            {config.costosFrecuentes.length > 0 && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Acceso rápido:</p>
                <div className="flex flex-wrap gap-2">
                  {config.costosFrecuentes.map(cf => (
                    <button
                      key={cf.id}
                      type="button"
                      onClick={() => agregarCostoFrecuente(cf)}
                      className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                    >
                      + {cf.descripcion} ({formatPeso(cf.monto)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {costos.map(costo => (
              <div key={costo.id} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Descripción"
                  value={costo.descripcion}
                  onChange={e => actualizarCosto(costo.id, 'descripcion', e.target.value)}
                  className="flex-1"
                />
                <InputMoneda
                  value={costo.monto || ''}
                  onChange={v => actualizarCosto(costo.id, 'monto', v)}
                  placeholder="Monto"
                  className={`${inputCls} w-28`}
                />
                <button
                  type="button"
                  onClick={() => eliminarCosto(costo.id)}
                  className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-2 shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <Boton variante="ghost" tamaño="sm" type="button" onClick={agregarCosto}>
              <Plus className="w-3 h-3" />
              Agregar costo
            </Boton>
          </div>
        )}
      </div>

      {/* Lote */}
      <div>
        <Label>Asignar a lote (opcional)</Label>
        <select
          value={loteId}
          onChange={e => setLoteId(e.target.value)}
          className={inputCls}
        >
          <option value="">Sin lote</option>
          {lotesAbiertos.map(l => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
      </div>

      {/* Notas */}
      <div>
        <Label>Notas (opcional)</Label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones sobre la compra..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-1">
        <Boton
          type="button"
          variante="primario"
          tamaño="lg"
          className="flex-1"
          disabled={!formularioValido}
          onClick={() => onGuardar(construirCompra())}
        >
          Guardar
        </Boton>
        {onGuardarNueva && (
          <Boton
            type="button"
            variante="secundario"
            tamaño="lg"
            className="flex-1"
            disabled={!formularioValido}
            onClick={() => onGuardarNueva(construirCompra())}
          >
            Guardar y nueva
          </Boton>
        )}
      </div>
    </div>
  )
}
