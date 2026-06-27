import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { RequestWithUser } from '../types'

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string }
  try {
    const result = await authService.login(email, password)
    res.json({ data: result })
  } catch (err: unknown) {
    res.status(401).json({ error: (err as Error).message })
  }
}

export function meHandler(req: Request, res: Response): void {
  const { user } = req as RequestWithUser
  res.json({ data: { usuario: user } })
}
