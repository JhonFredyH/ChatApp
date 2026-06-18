// src/controllers/dmController.js
import prisma from "../lib/prisma.js";

// ─── Obtener DMs entre dos usuarios ───────────────────────────────
export const getDMs = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId       = req.user.id;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: myId,   receiverId: userId },
          { senderId: userId, receiverId: myId   },
        ],
      },
      orderBy: { createdAt: "asc" },
      take:    50,
      include: {
        sender:   { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Marcar como leídos
    await prisma.directMessage.updateMany({
      where: { senderId: userId, receiverId: myId, readAt: null },
      data:  { readAt: new Date() },
    });

    return res.json(messages);
  } catch (err) {
    console.error("[getDMs]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ─── Enviar DM ─────────────────────────────────────────────────────
export const sendDM = async (req, res) => {
  try {
    const { userId }  = req.params;
    const { content } = req.body;
    const myId        = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId:   myId,
        receiverId: userId,
      },
      include: {
        sender:   { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error("[sendDM]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};
