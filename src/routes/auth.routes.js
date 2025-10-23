import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { loginRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);

export default router;
