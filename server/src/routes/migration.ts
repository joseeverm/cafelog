import { Router } from 'express'
import { importar } from '../controllers/migration.controller'

const router = Router()

router.post('/import', importar)

export default router
