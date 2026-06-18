// src/routes/dmRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDMs, sendDM } from "../controllers/dmController.js";

const router = Router();

router.use(protect);

router.get("/:userId",  getDMs);
router.post("/:userId", sendDM);

export default router;
