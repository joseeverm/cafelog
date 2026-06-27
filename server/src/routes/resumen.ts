import { Router } from 'express'
import * as ctrl from '../controllers/resumen.controller'

const router = Router()

router.get('/semana', ctrl.semana)

export default router
