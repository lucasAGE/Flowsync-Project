// src/middleware/security.middleware.js
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

/**
 * Helmet: headers de segurança
 * CORS: libera origens confiáveis
 * Rate Limit: evita abuso / brute-force
 */
export function applySecurity(app) {
  // Helmet com policy básica (ajuste CSP se servir front do mesmo domínio)
  app.use(helmet());

  // CORS (origens de dev por padrão). Ajuste .env CORS_ORIGIN se necessário.
  const origin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:3000', 'http://localhost:5173'];
  app.use(cors({ origin, credentials: true }));

  // Limite global — personalize janelas e máximos via .env
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000); // 15 min
  const max = Number(process.env.RATE_LIMIT_MAX ?? 300); // 300 req por janela por IP
  app.use(rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, error: 'TooManyRequests', message: 'Muitas requisições. Tente novamente em instantes.' },
  }));
}
