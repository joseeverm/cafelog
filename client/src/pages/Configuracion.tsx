import { useState, useRef } from 'react'
import { Sun, Moon, Gamepad2, Check, X, LogOut, Download, Upload } from 'lucide-react'
import InputMoneda from '../components/InputMoneda'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useThemeCtx } from '../context/ThemeContext'
import type { Theme } from '../hooks/useTheme'
import type { TipoCafe, CostoAdicional, Configuracion } from '../types'
import { generarId } from '../utils/formato'
import { parsearExcelImport } from '../utils/exportar'
import PageHeader from '../components/PageHeader'
import Boton from '../components/Boton'

const COLORES = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16']

const inputCls =
  'px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors'

const sectionCls =
  'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-sm overflow-hidden'

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{children}</h2>
    </div>
  )
}

const TEMAS: {
  id: Theme
  nombre: string
  desc: string
  Icon: React.ElementType
  preview: { bg: string; surface: string; accent: string; border: string; text: string }
}[] = [
  {
    id: 'light',
    nombre: 'Claro',
    desc: 'Limpio y luminoso',
    Icon: Sun,
    preview: { bg: '#e4e4e7', surface: '#ffffff', accent: '#f59e0b', border: '#d4d4d8', text: '#18181b' },
  },
  {
    id: 'dark',
    nombre: 'Oscuro',
    desc: 'Suave para los ojos',
    Icon: Moon,
    preview: { bg: '#09090b', surface: '#18181b', accent: '#f59e0b', border: '#27272a', text: '#f4f4f5' },
  },
  {
    id: 'gtavi',
    nombre: 'GTA VI',
    desc: 'Vice City nights',
    Icon: Gamepad2,
    preview: { bg: '#08060f', surface: '#0f0d1a', accent: '#f72585', border: 'rgba(247,37,133,0.3)', text: '#f0e6ff' },
  },
]

type ImportEstado = { tipo: 'idle' } | { tipo: 'procesando' } | { tipo: 'ok'; importadas: number; tiposCreados: number } | { tipo: 'error'; mensaje: string }

export default function Configuracion() {
  const { config, setConfig, agregarTipoCafe, editarTipoCafe, eliminarTipoCafe, migrarDesdeLocalStorage, importarComprasDesdeExcel } = useApp()
  const { logout } = useAuth()
  const { theme, setTheme } = useThemeCtx()
  const [editandoTipo, setEditandoTipo] = useState<TipoCafe | null>(null)
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '', color: COLORES[0] })
  const [editandoCosto, setEditandoCosto] = useState<CostoAdicional | null>(null)
  const [nuevoCosto, setNuevoCosto] = useState({ descripcion: '', monto: '' })
  const [migrando, setMigrando] = useState(false)
  const [migrado, setMigrado] = useState(localStorage.getItem('cafelog_migrated') === '1')
  const [importEstado, setImportEstado] = useState<ImportEstado>({ tipo: 'idle' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  function actualizarConfig(parcial: Partial<Configuracion>) {
    void setConfig({ ...config, ...parcial })
  }

  async function agregarTipo() {
    if (!nuevoTipo.nombre.trim()) return
    await agregarTipoCafe({ nombre: nuevoTipo.nombre.trim(), color: nuevoTipo.color })
    setNuevoTipo({ nombre: '', color: COLORES[0] })
  }

  async function guardarTipo() {
    if (!editandoTipo?.nombre.trim()) return
    await editarTipoCafe(editandoTipo.id, { nombre: editandoTipo.nombre, color: editandoTipo.color })
    setEditandoTipo(null)
  }

  async function eliminarTipo(id: string) {
    await eliminarTipoCafe(id)
  }

  async function handleMigrar() {
    if (!confirm('¿Migrar los datos guardados en este dispositivo a la cuenta? Esto no borra nada, solo los copia al servidor.')) return
    setMigrando(true)
    try {
      const resultado = await migrarDesdeLocalStorage()
      setMigrado(true)
      alert(`Migración completada: ${resultado.compras} compras, ${resultado.lotes} lotes, ${resultado.tiposCafe} tipos de café.`)
    } catch (err: unknown) {
      alert(`Error al migrar: ${(err as Error).message}`)
    } finally {
      setMigrando(false)
    }
  }

  async function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportEstado({ tipo: 'procesando' })
    try {
      const filas = await parsearExcelImport(file)
      const resultado = await importarComprasDesdeExcel(filas)
      setImportEstado({ tipo: 'ok', importadas: resultado.importadas, tiposCreados: resultado.tiposCreados })
    } catch (err) {
      setImportEstado({ tipo: 'error', mensaje: (err as Error).message })
    }
  }

  function agregarCosto() {
    const monto = parseFloat(nuevoCosto.monto)
    if (!nuevoCosto.descripcion.trim() || !monto) return
    actualizarConfig({ costosFrecuentes: [...config.costosFrecuentes, { id: generarId(), descripcion: nuevoCosto.descripcion.trim(), monto }] })
    setNuevoCosto({ descripcion: '', monto: '' })
  }

  function guardarCosto() {
    if (!editandoCosto?.descripcion.trim()) return
    actualizarConfig({ costosFrecuentes: config.costosFrecuentes.map(c => c.id === editandoCosto.id ? editandoCosto : c) })
    setEditandoCosto(null)
  }

  function eliminarCosto(id: string) {
    actualizarConfig({ costosFrecuentes: config.costosFrecuentes.filter(c => c.id !== id) })
  }

  const kilosEjemplo = 100
  const kilosSecosEj = kilosEjemplo * (1 - config.porcentajePerdidaSecado / 100)

  return (
    <div>
      <PageHeader titulo="Configuración" subtitulo="Personaliza CaféLog según tus necesidades" />

      <div className="p-4 md:p-8 space-y-5 max-w-2xl mx-auto">

        {/* Tema */}
        <div className={sectionCls}>
          <SectionHeader>Tema de la interfaz</SectionHeader>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {TEMAS.map(({ id, nombre, desc, Icon, preview }) => {
                const activo = theme === id
                return (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left ${
                      activo
                        ? 'border-amber-500 dark:border-amber-400 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {/* Mini preview */}
                    <div
                      className="h-20 w-full relative p-2.5 flex flex-col gap-1.5"
                      style={{ backgroundColor: preview.bg }}
                    >
                      {/* Barra superior simulada */}
                      <div
                        className="h-2 w-3/4 rounded-full opacity-60"
                        style={{ backgroundColor: preview.text }}
                      />
                      {/* Card simulada */}
                      <div
                        className="flex-1 rounded-lg flex items-center gap-1.5 px-2"
                        style={{ backgroundColor: preview.surface, border: `1px solid ${preview.border}` }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: preview.accent }}
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="h-1 rounded-full opacity-50 w-full" style={{ backgroundColor: preview.text }} />
                          <div className="h-1 rounded-full opacity-30 w-2/3" style={{ backgroundColor: preview.text }} />
                        </div>
                      </div>
                      {/* Botón simulado */}
                      <div
                        className="self-end h-2 w-1/3 rounded-full"
                        style={{
                          background: id === 'gtavi'
                            ? 'linear-gradient(90deg, #f72585, #7209b7)'
                            : preview.accent,
                          boxShadow: id === 'gtavi' ? '0 0 8px #f72585' : undefined,
                        }}
                      />
                    </div>

                    {/* Label */}
                    <div className="px-3 py-2.5 bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <Icon
                            className="w-3 h-3"
                            style={{ color: id === 'gtavi' ? '#f72585' : undefined }}
                          />
                            {nombre}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-none">{desc}</p>
                        </div>
                        {activo && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pérdida por secado */}
        <div className={sectionCls}>
          <SectionHeader>Porcentaje de pérdida por secado</SectionHeader>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-4 py-3">
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                De {kilosEjemplo} kg húmedos se obtienen{' '}
                <strong>{kilosSecosEj.toFixed(1)} kg secos</strong>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range" min="0" max="80" step="1"
                value={config.porcentajePerdidaSecado}
                onChange={e => actualizarConfig({ porcentajePerdidaSecado: parseInt(e.target.value) })}
                className="flex-1 h-2 accent-amber-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number" min="0" max="80"
                  value={config.porcentajePerdidaSecado}
                  onChange={e => actualizarConfig({ porcentajePerdidaSecado: Math.min(80, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className={`${inputCls} w-16 text-center`}
                />
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
              <span>0% (sin pérdida)</span><span>80% máximo</span>
            </div>
          </div>
        </div>

        {/* Tipos de café */}
        <div className={sectionCls}>
          <SectionHeader>Tipos de café</SectionHeader>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {config.tiposCafe.length === 0 && (
              <p className="px-5 py-4 text-sm text-zinc-400 dark:text-zinc-500">Sin tipos configurados.</p>
            )}
            {config.tiposCafe.map(tipo => (
              <div key={tipo.id} className="px-5 py-3">
                {editandoTipo?.id === tipo.id ? (
                  <div className="flex gap-2 items-center flex-wrap">
                    <input type="text" value={editandoTipo.nombre}
                      onChange={e => setEditandoTipo({ ...editandoTipo, nombre: e.target.value })}
                      className={`${inputCls} flex-1 min-w-32`} />
                    <ColorPicker valor={editandoTipo.color} onChange={c => setEditandoTipo({ ...editandoTipo, color: c })} />
                    <button onClick={guardarTipo} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditandoTipo(null)} className="px-3 py-1.5 text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tipo.color }} />
                    <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">{tipo.nombre}</span>
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditandoTipo(tipo)} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md">Editar</button>
                      <button onClick={() => eliminarTipo(tipo.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 border border-red-200 dark:border-red-500/30 rounded-md">Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Agregar tipo */}
            <div className="px-5 py-4 bg-zinc-100 dark:bg-zinc-800/50">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Agregar tipo</p>
              <div className="flex gap-2 flex-wrap">
                <input type="text" placeholder="Nombre del tipo" value={nuevoTipo.nombre}
                  onChange={e => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && agregarTipo()}
                  className={`${inputCls} flex-1 min-w-32`} />
                <ColorPicker valor={nuevoTipo.color} onChange={c => setNuevoTipo({ ...nuevoTipo, color: c })} />
                <Boton variante="primario" tamaño="sm" onClick={agregarTipo} disabled={!nuevoTipo.nombre.trim()}>
                  Agregar
                </Boton>
              </div>
            </div>
          </div>
        </div>

        {/* Costos frecuentes */}
        <div className={sectionCls}>
          <SectionHeader>Costos frecuentes</SectionHeader>
          <p className="px-5 pt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Aparecen como acceso rápido al crear una compra.
          </p>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 mt-3">
            {config.costosFrecuentes.length === 0 && (
              <p className="px-5 py-4 text-sm text-zinc-400 dark:text-zinc-500">Sin costos configurados.</p>
            )}
            {config.costosFrecuentes.map(costo => (
              <div key={costo.id} className="px-5 py-3">
                {editandoCosto?.id === costo.id ? (
                  <div className="flex gap-2 flex-wrap">
                    <input type="text" value={editandoCosto.descripcion}
                      onChange={e => setEditandoCosto({ ...editandoCosto, descripcion: e.target.value })}
                      className={`${inputCls} flex-1 min-w-32`} />
                    <InputMoneda
                      value={editandoCosto.monto}
                      onChange={v => setEditandoCosto({ ...editandoCosto, monto: parseFloat(v) || 0 })}
                      className={`${inputCls} w-28`}
                    />
                    <button onClick={guardarCosto} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditandoCosto(null)} className="px-3 py-1.5 text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">{costo.descripcion}</span>
                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums">
                      ${costo.monto.toLocaleString('es-CO')}
                    </span>
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditandoCosto(costo)} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md">Editar</button>
                      <button onClick={() => eliminarCosto(costo.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 border border-red-200 dark:border-red-500/30 rounded-md">Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Agregar costo */}
            <div className="px-5 py-4 bg-zinc-100 dark:bg-zinc-800/50">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Agregar costo</p>
              <div className="flex gap-2 flex-wrap">
                <input type="text" placeholder="Descripción" value={nuevoCosto.descripcion}
                  onChange={e => setNuevoCosto({ ...nuevoCosto, descripcion: e.target.value })}
                  className={`${inputCls} flex-1 min-w-32`} />
                <InputMoneda
                  value={nuevoCosto.monto}
                  onChange={v => setNuevoCosto({ ...nuevoCosto, monto: v })}
                  placeholder="Monto"
                  className={`${inputCls} w-28`}
                />
                <Boton variante="primario" tamaño="sm" onClick={agregarCosto}
                  disabled={!nuevoCosto.descripcion.trim() || !nuevoCosto.monto}>
                  Agregar
                </Boton>
              </div>
            </div>
          </div>
        </div>

        {/* Importar desde Excel */}
        <div className={sectionCls}>
          <SectionHeader>Importar datos</SectionHeader>
          <div className="p-5 space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Importa compras desde un archivo Excel exportado por CaféLog. Los tipos de café que no existan se crearán automáticamente.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={e => void handleImportar(e)}
            />
            <Boton
              variante="secundario"
              tamaño="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importEstado.tipo === 'procesando'}
            >
              <Upload className="w-3.5 h-3.5" />
              {importEstado.tipo === 'procesando' ? 'Importando…' : 'Seleccionar archivo .xlsx'}
            </Boton>
            {importEstado.tipo === 'ok' && (
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {importEstado.importadas} compra{importEstado.importadas !== 1 ? 's' : ''} importada{importEstado.importadas !== 1 ? 's' : ''}
                  {importEstado.tiposCreados > 0 && ` · ${importEstado.tiposCreados} tipo${importEstado.tiposCreados !== 1 ? 's' : ''} de café creado${importEstado.tiposCreados !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}
            {importEstado.tipo === 'error' && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2.5">
                <X className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">{importEstado.mensaje}</p>
              </div>
            )}
          </div>
        </div>

        {/* Migración desde localStorage */}
        {!migrado && (localStorage.getItem('cafelog_compras') || localStorage.getItem('cafelog_lotes')) && (
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Datos locales detectados
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Hay compras y lotes guardados en este dispositivo que aún no están en el servidor. Mígralos para verlos en todos tus dispositivos.
            </p>
            <Boton variante="primario" tamaño="sm" onClick={() => void handleMigrar()} disabled={migrando}>
              <Download className="w-3.5 h-3.5" />
              {migrando ? 'Migrando…' : 'Migrar mis datos al servidor'}
            </Boton>
          </div>
        )}

        {/* Sesión */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sesión</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Al cerrar sesión los datos permanecen seguros en el servidor.
          </p>
          <Boton variante="secundario" tamaño="sm" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </Boton>
        </div>
      </div>
    </div>
  )
}

function ColorPicker({ valor, onChange }: { valor: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {COLORES.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
            valor === c ? 'border-zinc-700 dark:border-zinc-200 scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={valor}
        onChange={e => onChange(e.target.value)}
        title="Color personalizado"
        className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent"
      />
    </div>
  )
}
