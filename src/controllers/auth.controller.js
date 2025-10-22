import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const users = []; // simulação de banco em memória (vamos trocar por Prisma depois)

export async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "E-mail e senha obrigatórios" });

  const existing = users.find((u) => u.email === email);
  if (existing)
    return res.status(400).json({ message: "Usuário já registrado." });

  const hashed = await bcrypt.hash(password, 10);
  const user = { email, password: hashed };
  users.push(user);

  console.log("Novo usuário:", email, "Senha criptografada:", hashed);
  res.status(201).json({ message: "Usuário registrado com sucesso!" });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "E-mail e senha obrigatórios" });

  const user = users.find((u) => u.email === email);
  if (!user)
    return res.status(401).json({ message: "Usuário não encontrado." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Senha incorreta." });

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "Login realizado com sucesso!", token });
}
