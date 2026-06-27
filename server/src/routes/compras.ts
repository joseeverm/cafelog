import { Router } from 'express'
import * as ctrl from '../controllers/compras.controller'
import { validate } from '../middleware/validate'
import { compraInputSchema } from '../schemas/compra.schema'

const router = Router()

router.get('/', ctrl.listar)
router.post('/', validate(compraInputSchema), ctrl.crear)
router.get('/:id', ctrl.obtener)
router.put('/:id', validate(compraInputSchema), ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

export default router
