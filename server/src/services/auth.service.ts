import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/client'
import { env } from '../config/env'
import { AuthUser } from '../types'

export async function login(email: string, password: string): Promise<{ token: string; usuario: AuthUser }> {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) throw new Error('Credenciales inválidas')

  const valid = await bcrypt.compare(password, usuario.passwordHash)
  if (!valid) throw new Error('Credenciales inválidas')

  const payload: AuthUser = { id: usuario.id, email: usuario.email, nombre: usuario.nombre }
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })

  return { token, usuario: payload }
}
