import { Router } from 'express'
import { loginHandler, meHandler } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const router = Router()

router.post('/login', validate(loginSchema), loginHandler)
router.get('/me', authMiddleware, meHandler)

export default router
