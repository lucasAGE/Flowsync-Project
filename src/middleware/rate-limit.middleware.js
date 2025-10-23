// src/middleware/rate-limit.middleware.js
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limit específico para tentativas de login
 * Impede brute-force e abuso em /auth/login
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'TooManyRequests',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  handler: (req, res, next, options) => {
    console.warn(`⚠️  IP bloqueado por excesso de login: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },

  // ✅ Corrige a validação IPv6
  keyGenerator: ipKeyGenerator,
});