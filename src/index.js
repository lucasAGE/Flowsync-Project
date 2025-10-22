import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth.routes.js";
import { secureRouter } from "./routes/secure.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/auth", authRouter);
app.use("/secure", secureRouter); // rota protegida

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
