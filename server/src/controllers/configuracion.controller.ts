import { Request, Response } from 'express'
import * as configuracionService from '../services/configuracion.service'
import { RequestWithUser } from '../types'

export async function obtener(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const config = await configuracionService.obtener(user.id)
  res.json({ data: config })
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const config = await configuracionService.actualizar(req.body, user.id)
  res.json({ data: config })
}
