import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { apiRouter } from './routes'

export function createApp() {
  const app = express()

  app.use(helmet())
  // CORS_ORIGIN=* permite cualquier origen (útil durante deploy inicial).
  // En producción cambiarlo al dominio exacto del frontend.
  const corsOrigin =
    env.CORS_ORIGIN === '*'
      ? true
      : env.CORS_ORIGIN.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
  app.use(cors({ origin: corsOrigin, credentials: true }))
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/v1', apiRouter)

  app.use(errorHandler)

  return app
}
