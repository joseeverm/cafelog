import { Router } from 'express'
import * as ctrl from '../controllers/lotes.controller'
import { validate } from '../middleware/validate'
import { loteCreateSchema, loteUpdateSchema, venderLoteSchema, comprasLoteSchema } from '../schemas/lote.schema'

const router = Router()

router.get('/', ctrl.listar)
router.post('/', validate(loteCreateSchema), ctrl.crear)
router.get('/:id', ctrl.obtener)
router.put('/:id', validate(loteUpdateSchema), ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)
router.put('/:id/vender', validate(venderLoteSchema), ctrl.vender)
router.put('/:id/compras', validate(comprasLoteSchema), ctrl.actualizarCompras)

export default router
