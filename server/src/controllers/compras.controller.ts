import { Request, Response } from 'express'
import * as comprasService from '../services/compras.service'
import { RequestWithUser } from '../types'

export async function listar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const filtros = {
    semana: req.query.semana as string | undefined,
    tipoCafeId: req.query.tipoCafeId as string | undefined,
    agricultor: req.query.agricultor as string | undefined,
    estado: req.query.estado as 'humedo' | 'seco' | undefined,
    loteId: req.query.loteId as string | undefined,
  }
  const compras = await comprasService.listar(user.id, filtros)
  res.json({ data: compras })
}

export async function obtener(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const compra = await comprasService.obtener(req.params.id as string, user.id)
  if (!compra) {
    res.status(404).json({ error: 'Compra no encontrada' })
    return
  }
  res.json({ data: compra })
}

export async function crear(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const compra = await comprasService.crear(req.body, user.id)
  res.status(201).json({ data: compra })
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const compra = await comprasService.actualizar(req.params.id as string, req.body, user.id)
  if (!compra) {
    res.status(404).json({ error: 'Compra no encontrada' })
    return
  }
  res.json({ data: compra })
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const compra = await comprasService.eliminar(req.params.id as string, user.id)
  if (!compra) {
    res.status(404).json({ error: 'Compra no encontrada' })
    return
  }
  res.json({ data: { ok: true } })
}
