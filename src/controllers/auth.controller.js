import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    // Verifica se já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: 'E-mail já registrado.' });

    // Criptografa a senha
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: { email, password: hash },
      select: { id: true, email: true, createdAt: true }
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso.', user });
  } catch (err) {
    next(err);
  }
};

// trecho do login no auth.controller.js
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`🚫 Tentativa de login falhou — email inexistente: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.warn(`🚫 Senha incorreta para o usuário: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`✅ Login bem-sucedido: ${email}`);

    return res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
};
