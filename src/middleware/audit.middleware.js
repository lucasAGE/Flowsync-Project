// src/middleware/audit.middleware.js
import chalk from 'chalk';
import prisma from '../prisma/client.js';

/**
 * Middleware de auditoria de requisições HTTP.
 * Mostra logs coloridos no terminal e salva no banco (tabela AuditLog).
 */
export function auditLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', async () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    const method = req.method.padEnd(6);
    const status = res.statusCode;
    const url = req.originalUrl;
    const user = req.user?.email || 'anon';
    const userId = req.user?.id || null;

    // Escolhe cor com base no status
    let color = chalk.white;
    if (status >= 500) color = chalk.red;
    else if (status >= 400) color = chalk.yellow;
    else if (status >= 300) color = chalk.cyan;
    else if (status >= 200) color = chalk.green;

    const timeColor = durationMs > 500 ? chalk.redBright : chalk.gray;

    // Exibe no console
    console.log(
      `${color(`[${status}]`)} ${method} ${url} - ${timeColor(`${durationMs.toFixed(1)} ms`)} - user: ${chalk.blue(user)}`
    );

    // Tenta gravar no banco
    try {
      await prisma.auditLog.create({
        data: {
          method,
          route: url,
          status,
          durationMs,
          ip: req.ip,
          userEmail: user === 'anon' ? null : user,
          userId,
          message: status >= 400 ? 'Erro ou acesso não autorizado' : 'OK',
        },
      });
    } catch (err) {
      console.error(chalk.red(`⚠️ Falha ao salvar auditoria: ${err.message}`));
    }
  });

  next();
}
