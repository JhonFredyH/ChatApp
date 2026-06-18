// src/server.js
import express       from "express";
import cors          from "cors";
import helmet        from "helmet";
import cookieParser  from "cookie-parser";
import { createServer } from "http";
import { Server }       from "socket.io";
import authRoutes    from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import dmRoutes      from "./routes/dmRoutes.js";
import prisma        from "./lib/prisma.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 3001;

// ─── Socket.io ─────────────────────────────────────────────────────
export const io = new Server(server, {
  cors: {
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Map(); // socketId → userId

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id);

  // Usuario se identifica al conectar
  socket.on("user:join", async (userId) => {
    onlineUsers.set(socket.id, userId);
    try {
      await prisma.user.update({
        where: { id: userId },
        data:  { isOnline: true, lastSeen: new Date() },
      });
    } catch (err) {
      console.error("[user:join]", err);
    }
    socket.broadcast.emit("user:online", userId);
    console.log("User online:", userId);
  });

  // Unirse a canal o sala DM
  socket.on("channel:join", (roomId) => {
    socket.join(roomId);
  });

  // Salir de canal o sala DM
  socket.on("channel:leave", (roomId) => {
    socket.leave(roomId);
  });

  // Mensaje en canal — guardar en DB y emitir
  socket.on("message:send", async ({ channelId, content, userId }) => {
    try {
      const message = await prisma.message.create({
        data: { content, channelId, userId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });
      io.to(channelId).emit("message:new", message);
    } catch (err) {
      console.error("[message:send]", err);
    }
  });

  // DM en tiempo real — guardar en DB y emitir a la sala privada
  socket.on("dm:send", async ({ senderId, receiverId, content, roomId }) => {
    try {
      const message = await prisma.directMessage.create({
        data: { content, senderId, receiverId },
        include: {
          sender:   { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });
      io.to(roomId).emit("dm:new", message);
    } catch (err) {
      console.error("[dm:send]", err);
    }
  });

  // Typing indicator
  socket.on("typing:start", ({ channelId, userName }) => {
    socket.to(channelId).emit("typing:start", { userName });
  });

  socket.on("typing:stop", ({ channelId }) => {
    socket.to(channelId).emit("typing:stop");
  });

  // Desconexión
  socket.on("disconnect", async () => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      onlineUsers.delete(socket.id);
      try {
        await prisma.user.update({
          where: { id: userId },
          data:  { isOnline: false, lastSeen: new Date() },
        });
      } catch (err) {
        console.error("[disconnect]", err);
      }
      socket.broadcast.emit("user:offline", userId);
    }
    console.log("Socket desconectado:", socket.id);
  });
});

// ─── Middlewares ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ─── Rutas ─────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/dms",      dmRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/upload", uploadRoutes);

// ─── Seed canales por defecto ──────────────────────────────────────
const seedChannels = async () => {
  const defaults = ["general", "desarrollo", "diseño", "random"];
  for (const name of defaults) {
    await prisma.channel.upsert({
      where:  { name },
      update: {},
      create: { name },
    });
  }
  console.log("Canales por defecto listos");
};

// ─── Arrancar ──────────────────────────────────────────────────────
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedChannels();
});

export default app;
