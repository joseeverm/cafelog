import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import authRouter from './auth'
import comprasRouter from './compras'
import lotesRouter from './lotes'
import tiposCafeRouter from './tiposCafe'
import configuracionRouter from './configuracion'
import resumenRouter from './resumen'
import migrationRouter from './migration'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)

// Todas las rutas siguientes requieren token
apiRouter.use(authMiddleware)
apiRouter.use('/compras', comprasRouter)
apiRouter.use('/lotes', lotesRouter)
apiRouter.use('/tipos-cafe', tiposCafeRouter)
apiRouter.use('/configuracion', configuracionRouter)
apiRouter.use('/resumen', resumenRouter)
apiRouter.use('/migration', migrationRouter)
