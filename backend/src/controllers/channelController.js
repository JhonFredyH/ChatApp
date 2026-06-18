// src/controllers/channelController.js
import prisma from "../lib/prisma.js";

// ─── Obtener todos los canales ─────────────────────────────────────
export const getChannels = async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { messages: true } },
      },
    });
    return res.json(channels);
  } catch (err) {
    console.error("[getChannels]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ─── Obtener mensajes de un canal ──────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await prisma.message.findMany({
      where:   { channelId },
      orderBy: { createdAt: "asc" },
      take:    50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
    return res.json(messages);
  } catch (err) {
    console.error("[getMessages]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ─── Crear mensaje ─────────────────────────────────────────────────
export const createMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content }   = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error("[createMessage]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ─── Crear canal ───────────────────────────────────────────────────
export const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const channel = await prisma.channel.create({
      data: { name: name.toLowerCase().trim(), description },
    });

    return res.status(201).json(channel);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Ya existe un canal con ese nombre" });
    }
    console.error("[createChannel]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ─── Obtener usuarios (para DMs y online status) ───────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where:  { id: { not: req.user.id } },
      select: { id: true, name: true, avatar: true, isOnline: true, lastSeen: true },
      orderBy: { name: "asc" },
    });
    return res.json(users);
  } catch (err) {
    console.error("[getUsers]", err);
    return res.status(500).json({ message: "Error interno" });
  }
};
