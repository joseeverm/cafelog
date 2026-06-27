import { Request, Response } from 'express'
import * as tiposCafeService from '../services/tiposCafe.service'
import { RequestWithUser } from '../types'

export async function listar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const tipos = await tiposCafeService.listar(user.id)
  res.json({ data: tipos })
}

export async function crear(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const tipo = await tiposCafeService.crear(req.body, user.id)
  res.status(201).json({ data: tipo })
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const tipo = await tiposCafeService.actualizar(req.params.id as string, req.body, user.id)
  if (!tipo) {
    res.status(404).json({ error: 'Tipo de café no encontrado' })
    return
  }
  res.json({ data: tipo })
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  try {
    const tipo = await tiposCafeService.eliminar(req.params.id as string, user.id)
    if (!tipo) {
      res.status(404).json({ error: 'Tipo de café no encontrado' })
      return
    }
    res.json({ data: { ok: true } })
  } catch (err: unknown) {
    res.status(409).json({ error: (err as Error).message })
  }
}
