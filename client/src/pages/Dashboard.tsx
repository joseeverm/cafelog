import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scale, Sun, Wallet, BarChart3,
  ChevronLeft, ChevronRight, Plus, Sprout,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  resumenSemana,
  getSemanaActual,
  semanaAnterior,
  semanaSiguiente,
  formatSemanaLabel,
} from '../utils/calculos'
import { formatPeso, formatNumero, formatFecha } from '../utils/formato'
import Tarjeta from '../components/Tarjeta'
import BadgeEstado from '../components/BadgeEstado'
import Boton from '../components/Boton'
import Modal from '../components/Modal'
import FormularioCompra from '../components/FormularioCompra'
import type { Compra } from '../types'

export default function Dashboard() {
  const { compras, config, agregarCompra, editarCompra } = useApp()
  const navigate = useNavigate()
  const [semana, setSemana] = useState(getSemanaActual())
  const [modalAbierto, setModalAbierto] = useState(false)
  const [compraEditando, setCompraEditando] = useState<Compra | null>(null)

  const resumen = resumenSemana(compras, semana, config)
  const esActual = semana === getSemanaActual()
  const comprasRecientes = compras.slice(0, 5)

  function getTipoCafe(id: string) {
    return config.tiposCafe.find(t => t.id === id)
  }

  function handleGuardar(datos: Omit<Compra, 'id'>) {
    agregarCompra(datos)
    setModalAbierto(false)
  }

  function handleGuardarNueva(datos: Omit<Compra, 'id'>) {
    agregarCompra(datos)
  }

  function handleEditar(datos: Omit<Compra, 'id'>) {
    if (!compraEditando) return
    editarCompra(compraEditando.id, datos)
    setCompraEditando(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Header ── */}
      <div className="page-header relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Panel de control</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Resumen de actividad semanal</p>
          </div>
          <Boton variante="primario" onClick={() => setModalAbierto(true)}>
            <Plus className="w-4 h-4" />
            Nueva Compra
          </Boton>
        </div>

        {/* Selector de semana */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setSemana(semanaAnterior(semana))}
            className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 text-center min-w-40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {formatSemanaLabel(semana)}
            </p>
            {esActual && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Semana actual</p>
            )}
          </div>
          <button
            onClick={() => setSemana(semanaSiguiente(semana))}
            className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 space-y-6">
        {/* Tarjetas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tarjeta
            titulo="Kilos comprados"
            valor={`${formatNumero(resumen.totalKilosComprados)} kg`}
            subtitulo={`${resumen.cantidadCompras} compra${resumen.cantidadCompras !== 1 ? 's' : ''}`}
            icon={Scale}
          />
          <Tarjeta
            titulo="Kilos secos est."
            valor={`${formatNumero(resumen.totalKilosSecos)} kg`}
            subtitulo={`${config.porcentajePerdidaSecado}% de pérdida`}
            icon={Sun}
          />
          <Tarjeta
            titulo="Total invertido"
            valor={formatPeso(resumen.totalInvertido)}
            icon={Wallet}
            positivo={false}
          />
          <Tarjeta
            titulo="Compras esta semana"
            valor={resumen.cantidadCompras.toString()}
            icon={BarChart3}
          />
        </div>

        {/* Compras recientes */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Compras recientes</h2>
            <button
              onClick={() => navigate('/historial')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {comprasRecientes.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-60">
                <Sprout className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sin compras registradas</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Agrega tu primera compra con el botón de arriba
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {comprasRecientes.map(compra => {
                const tipo = getTipoCafe(compra.tipoCafeId)
                const total =
                  compra.kilos * compra.precioPorKilo +
                  compra.costosAdicionales.reduce((s, c) => s + c.monto, 0)
                return (
                  <div
                    key={compra.id}
                    onClick={() => setCompraEditando(compra)}
                    className="flex items-center px-5 py-3.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors gap-3 cursor-pointer"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tipo?.color ?? '#a1a1aa' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {compra.agricultor}
                        </p>
                        <BadgeEstado estado={compra.estado} />
                      </div>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {formatFecha(compra.fecha)} · {tipo?.nombre ?? '—'} · {formatNumero(compra.kilos)} kg
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 tabular-nums">
                      {formatPeso(total)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal nueva compra */}
      <Modal titulo="Nueva Compra" abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} tamaño="lg">
        <FormularioCompra onGuardar={handleGuardar} onGuardarNueva={handleGuardarNueva} />
      </Modal>

      {/* Modal editar compra */}
      <Modal titulo="Editar Compra" abierto={!!compraEditando} onCerrar={() => setCompraEditando(null)} tamaño="lg">
        {compraEditando && <FormularioCompra compraInicial={compraEditando} onGuardar={handleEditar} />}
      </Modal>

      {/* FAB móvil */}
      <button
        onClick={() => setModalAbierto(true)}
        className="md:hidden fixed right-4 bottom-20 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
