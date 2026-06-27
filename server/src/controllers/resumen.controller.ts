import { Request, Response } from 'express'
import * as resumenService from '../services/resumen.service'
import { RequestWithUser } from '../types'

export async function semana(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  const semanaParam = req.query.semana as string | undefined

  if (!semanaParam || !/^\d{4}-W\d{2}$/.test(semanaParam)) {
    res.status(400).json({ error: 'Parámetro semana requerido. Formato: YYYY-WNN (ej: 2025-W26)' })
    return
  }

  const resumen = await resumenService.resumenSemana(semanaParam, user.id)
  res.json({ data: resumen })
}
