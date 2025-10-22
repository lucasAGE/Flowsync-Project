import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

export const secureRouter = express.Router();

secureRouter.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Acesso autorizado!",
    user: req.user,
  });
});
