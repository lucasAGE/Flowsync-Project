// src/schemas/auth.schema.js
import { z } from 'zod';

// Regras para registrar usuário
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
});

// Regras para login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
});
