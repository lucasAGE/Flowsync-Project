// src/logger.js
import morgan from 'morgan';
import crypto from 'crypto';

/**
 * Gera um requestId simples para correlacionar logs e erros
 */
export function requestId() {
  return (req, _res, next) => {
    req.id = req.headers['x-request-id']?.toString() || crypto.randomUUID();
    next();
  };
}

/**
 * Morgan + formatação baseada no ambiente
 */
export function httpLogger() {
  // em produção, formato "combined"; em dev, mais legível
  const format = process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms :req[x-request-id]';

  // acrescenta o requestId no header para facilitar tracing
  const withRequestId = (req, res, next) => {
    res.setHeader('x-request-id', req.id);
    next();
  };

  // stream padrão (console)
  return [withRequestId, morgan(format)];
}
