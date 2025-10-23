import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

/**
 * Exemplo de rota protegida que pode lançar erro assíncrono
 * e será capturada pelo asyncHandler → errorConverter → errorHandler
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  // aqui você pode acessar req.user do JWT
  res.json({ ok: true, user: req.user });
}));

export default router;
