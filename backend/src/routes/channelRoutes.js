// src/routes/channelRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChannels,
  getMessages,
  createMessage,
  createChannel,
  getUsers,
} from "../controllers/channelController.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// RUTAS ESTÁTICAS PRIMERO (antes de las rutas con parámetros)
router.get("/users/all",               getUsers);  // ← MOVIDO ARRIBA
router.get("/",                        getChannels);
router.post("/",                       createChannel);

// RUTAS DINÁMICAS DESPUÉS
router.get("/:channelId/messages",     getMessages);
router.post("/:channelId/messages",    createMessage);

export default router;
