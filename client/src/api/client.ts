import type { Compra, Lote, Configuracion, TipoCafe, CostoAdicional, ResumenSemana } from '../types'

// Por defecto ruta relativa: en dev/preview el proxy de Vite la reenvía al
// backend (ver vite.config.ts). En producción el frontend vive en otro dominio,
// así que ahí se define VITE_API_URL con la URL absoluta de la API.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1'

function getToken(): string | null {
  return localStorage.getItem('cafelog_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Solo forzar logout si había token activo (token expirado en ruta protegida).
    // Si no había token (ej: login con credenciales incorrectas) lanzar el error normal.
    if (res.status === 401 && token) {
      localStorage.removeItem('cafelog_token')
      window.dispatchEvent(new Event('cafelog:unauthorized'))
    }
    throw new Error((json as { error?: string }).error ?? `Error ${res.status}`)
  }

  return (json as { data: T }).data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function apiLogin(email: string, password: string) {
  return request<{ token: string; usuario: { id: string; email: string; nombre: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  )
}

export function apiMe() {
  return request<{ usuario: { id: string; email: string; nombre: string } }>('/auth/me')
}

// ── Configuración ─────────────────────────────────────────────────────────────

export function apiGetConfiguracion() {
  return request<Configuracion>('/configuracion')
}

export function apiUpdateConfiguracion(data: {
  porcentajePerdidaSecado?: number
  costosFrecuentes?: CostoAdicional[]
}) {
  return request<Configuracion>('/configuracion', { method: 'PUT', body: JSON.stringify(data) })
}

// ── Tipos de café ─────────────────────────────────────────────────────────────

export function apiCrearTipoCafe(data: { nombre: string; color: string }) {
  return request<TipoCafe>('/tipos-cafe', { method: 'POST', body: JSON.stringify(data) })
}

export function apiEditarTipoCafe(id: string, data: { nombre: string; color: string }) {
  return request<TipoCafe>(`/tipos-cafe/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiEliminarTipoCafe(id: string) {
  return request<{ ok: boolean }>(`/tipos-cafe/${id}`, { method: 'DELETE' })
}

// ── Compras ───────────────────────────────────────────────────────────────────

export function apiGetCompras() {
  return request<Compra[]>('/compras')
}

export function apiCrearCompra(data: Omit<Compra, 'id'>) {
  return request<Compra>('/compras', { method: 'POST', body: JSON.stringify(data) })
}

export function apiEditarCompra(id: string, data: Omit<Compra, 'id'>) {
  return request<Compra>(`/compras/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiEliminarCompra(id: string) {
  return request<{ ok: boolean }>(`/compras/${id}`, { method: 'DELETE' })
}

// ── Lotes ─────────────────────────────────────────────────────────────────────

export function apiGetLotes() {
  return request<Lote[]>('/lotes')
}

export function apiCrearLote(data: { nombre: string; fechaCreacion: string }) {
  return request<Lote>('/lotes', { method: 'POST', body: JSON.stringify(data) })
}

export function apiEditarLote(id: string, data: { nombre?: string; gastosAdicionales?: CostoAdicional[] }) {
  return request<Lote>(`/lotes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiVenderLote(id: string, precioVentaPorKilo: number) {
  return request<Lote>(`/lotes/${id}/vender`, {
    method: 'PUT',
    body: JSON.stringify({ precioVentaPorKilo }),
  })
}

export function apiActualizarComprasLote(id: string, compraIds: string[]) {
  return request<Lote>(`/lotes/${id}/compras`, {
    method: 'PUT',
    body: JSON.stringify({ compraIds }),
  })
}

export function apiEliminarLote(id: string) {
  return request<{ ok: boolean }>(`/lotes/${id}`, { method: 'DELETE' })
}

// ── Resumen ───────────────────────────────────────────────────────────────────

export function apiResumenSemana(semana: string) {
  return request<ResumenSemana>(`/resumen/semana?semana=${encodeURIComponent(semana)}`)
}

// ── Migración ─────────────────────────────────────────────────────────────────

export function apiImportar(payload: { compras: Compra[]; lotes: Lote[]; config: Configuracion }) {
  return request<{ ok: boolean; importado: { tiposCafe: number; lotes: number; compras: number } }>(
    '/migration/import',
    { method: 'POST', body: JSON.stringify(payload) },
  )
}
