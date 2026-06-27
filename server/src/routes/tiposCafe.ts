import { Router } from 'express'
import * as ctrl from '../controllers/tiposCafe.controller'
import { validate } from '../middleware/validate'
import { tipoCafeInputSchema } from '../schemas/tipoCafe.schema'

const router = Router()

router.get('/', ctrl.listar)
router.post('/', validate(tipoCafeInputSchema), ctrl.crear)
router.put('/:id', validate(tipoCafeInputSchema), ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

export default router
