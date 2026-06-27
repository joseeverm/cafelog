import { Request, Response } from 'express'
import * as migrationService from '../services/migration.service'
import { RequestWithUser } from '../types'

export async function importar(req: Request, res: Response): Promise<void> {
  const { user } = req as RequestWithUser
  try {
    const resultado = await migrationService.importar(req.body, user.id)
    res.json({ data: { ok: true, importado: resultado } })
  } catch (err: unknown) {
    res.status(400).json({ error: 'Error al importar datos', details: (err as Error).message })
  }
}
