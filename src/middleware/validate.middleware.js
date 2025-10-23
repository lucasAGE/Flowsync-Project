// src/middleware/validate.middleware.js
import { ZodError } from 'zod';
import { AppError } from './error.middleware.js';

/**
 * Middleware genérico de validação usando Zod.
 * Recebe um schema e valida req.body, req.params e req.query.
 */
export function validate(schema) {
  return (req, _res, next) => {
    try {
      // Valida todos os campos possíveis
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return next(new AppError('Erro de validação', 400, formatted));
      }
      next(err);
    }
  };
}
