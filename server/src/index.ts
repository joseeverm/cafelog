import 'dotenv/config'
import { createApp } from './app'
import { env } from './config/env'
import { prisma } from './db/client'

const app = createApp()

const server = app.listen(Number(env.PORT), () => {
  console.log(`🚀 CaféLog API corriendo en http://localhost:${env.PORT}`)
  console.log(`   Entorno: ${env.NODE_ENV}`)
  console.log(`   CORS origin: ${env.CORS_ORIGIN}`)
})

process.on('SIGTERM', async () => {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
})
