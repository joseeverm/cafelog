import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas o faltantes:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
