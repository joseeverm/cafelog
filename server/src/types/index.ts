import { Request } from 'express'

export interface AuthUser {
  id: string
  email: string
  nombre: string
}

export interface RequestWithUser extends Request {
  user: AuthUser
}

export type ApiResponse<T> = {
  data: T
}

export type ApiError = {
  error: string
  details?: unknown
}

export interface CostoAdicional {
  id: string
  descripcion: string
  monto: number
}

export type EstadoCafe = 'humedo' | 'seco'
export type EstadoLote = 'abierto' | 'vendido'
