import express from 'express';
import 'dotenv/config';
import prisma from './prisma/client.js';
import authRoutes from './routes/auth.routes.js';
import secureRoutes from './routes/secure.routes.js';

import { applySecurity } from './middleware/security.middleware.js';
import { requestId, httpLogger } from './logger.js';
import { errorConverter, errorHandler, AppError } from './middleware/error.middleware.js';

import { auditLogger } from './middleware/audit.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// -------- Core middlewares --------
app.use(express.json({ limit: '1mb' }));
app.use(requestId(), ...httpLogger());

// -------- Auditoria de requisições --------
app.use(auditLogger);

// -------- Segurança --------
applySecurity(app);

// -------- Healthcheck --------
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Falha na conexão com o banco:', error.message);
    res.status(500).json({ status: 'error', details: 'DB connection failed' });
  }
});

// -------- Rotas --------
app.use('/auth', authRoutes);
app.use('/secure', secureRoutes);

// -------- 404 (rota não encontrada) --------
app.use((req, _res, next) => {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
});

// -------- Conversão e tratamento global de erros --------
app.use(errorConverter);
app.use(errorHandler);

// -------- Inicialização --------
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
