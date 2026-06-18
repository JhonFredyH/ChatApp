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

router.get("/",                        getChannels);
router.post("/",                       createChannel);
router.get("/:channelId/messages",     getMessages);
router.post("/:channelId/messages",    createMessage);
router.get("/users/all",               getUsers);

export default router;
