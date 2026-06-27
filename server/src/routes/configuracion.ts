import { Router } from 'express'
import * as ctrl from '../controllers/configuracion.controller'
import { validate } from '../middleware/validate'
import { configuracionUpdateSchema } from '../schemas/configuracion.schema'

const router = Router()

router.get('/', ctrl.obtener)
router.put('/', validate(configuracionUpdateSchema), ctrl.actualizar)

export default router
