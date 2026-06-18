import { Router }   from "express";
import rateLimit    from "express-rate-limit";
import { register, login, logout } from "../controllers/authController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { message: "Demasiados intentos. Espera 15 minutos." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/logout",   logout);

export default router;