// src/middleware/error.middleware.js
import { Prisma } from '@prisma/client';

/**
 * AppError: erro padronizado da aplicação
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = Array.isArray(details) ? details : [];
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Converte erros de bibliotecas (Prisma, JWT, etc.) para AppError
 */
export function errorConverter(err, _req, _res, next) {
  try {
    // Já é AppError → segue direto
    if (err instanceof AppError) return next(err);

    // Body JSON inválido
    if (err instanceof SyntaxError && 'body' in err) {
      return next(new AppError('JSON malformado no corpo da requisição.', 400));
    }

    // Erros do Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return next(
          new AppError('Registro já existe (violação de unicidade).', 409, [
            { target: err.meta?.target || 'campo duplicado' },
          ])
        );
      }
      if (err.code === 'P2025') {
        return next(new AppError('Registro não encontrado.', 404));
      }
      return next(
        new AppError(`Erro de banco de dados (Prisma ${err.code}).`, 400)
      );
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      return next(new AppError('Dados inválidos para o banco de dados.', 400));
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
      return next(
        new AppError('Falha ao inicializar conexão com o banco.', 500, [
          { message: err.message },
        ])
      );
    }

    // Erros de JWT
    if (err?.name === 'TokenExpiredError')
      return next(new AppError('Token expirado.', 401));
    if (err?.name === 'JsonWebTokenError')
      return next(new AppError('Token inválido.', 401));
    if (err?.name === 'NotBeforeError')
      return next(new AppError('Token ainda não é válido (nbf).', 401));

    // Qualquer outro erro genérico
    return next(new AppError(err.message || 'Erro interno do servidor.', 500));
  } catch (internalErr) {
    console.error('⚠️ Erro interno no errorConverter:', internalErr);
    return next(new AppError('Falha ao processar erro interno.', 500));
  }
}

/**
 * Handler final de erro — deve ser o ÚLTIMO middleware
 */
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;

  const payload = {
    status,
    error: err.name || 'Error',
    message: err.message || 'Erro interno do servidor.',
    details: Array.isArray(err.details) ? err.details : undefined,
    requestId: req.id || undefined,
  };

  // Em desenvolvimento, inclui o stack trace
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

/**
 * Helper para rotas assíncronas, evitando try/catch repetitivo
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
