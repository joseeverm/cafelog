import { Request, Response } from 'express'
import * as lotesService from '../services/lotes.service'
import { RequestWithUser } from '../types'

export async function listar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lotes = await lotesService.listar(user.id)
  res.json({ data: lotes })
}

export async function obtener(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.obtener(req.params.id as string, user.id)
  if (!lote) {
    res.status(404).json({ error: 'Lote no encontrado' })
    return
  }
  res.json({ data: lote })
}

export async function crear(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.crear(req.body, user.id)
  res.status(201).json({ data: lote })
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.actualizar(req.params.id as string, req.body, user.id)
  if (!lote) {
    res.status(404).json({ error: 'Lote no encontrado' })
    return
  }
  res.json({ data: lote })
}

export async function vender(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.vender(req.params.id as string, req.body.precioVentaPorKilo, user.id)
  if (!lote) {
    res.status(404).json({ error: 'Lote no encontrado' })
    return
  }
  res.json({ data: lote })
}

export async function actualizarCompras(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.actualizarCompras(req.params.id as string, req.body.compraIds, user.id)
  if (!lote) {
    res.status(404).json({ error: 'Lote no encontrado' })
    return
  }
  res.json({ data: lote })
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const lote = await lotesService.eliminar(req.params.id as string, user.id)
  if (!lote) {
    res.status(404).json({ error: 'Lote no encontrado' })
    return
  }
  res.json({ data: { ok: true } })
}
