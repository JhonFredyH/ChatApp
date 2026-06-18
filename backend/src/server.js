import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import dmRoutes from './routes/dmRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Configuración de CORS para múltiples dominios
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://chat-app-sigma-six-76.vercel.app',
  'https://chat-9bu4njzd6-jhonfredyhs-projects.vercel.app',
  'https://chatapp-git-main-jhonfredyhs-projects.vercel.app',
];

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`Socket ${socket.id} se unió al canal ${channelId}`);
  });

  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`Socket ${socket.id} dejó el canal ${channelId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { content, channelId, senderId, type } = data;
      
      const message = await prisma.message.create({
        data: {
          content,
          type: type || 'text',
          channelId: channelId,
          senderId: senderId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      io.to(channelId).emit('new-message', message);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Seed de canales (NO BLOQUEANTE)
const seedChannels = async () => {
  try {
    console.log('⏳ Intentando crear canales por defecto...');
    
    // Esperar 5 segundos para dar tiempo a que la DB esté lista
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const defaultChannels = [
      { name: 'general', description: 'Canal general del equipo' },
      { name: 'desarrollo', description: 'Discusiones sobre desarrollo' },
      { name: 'diseño', description: 'Discusiones sobre diseño' },
      { name: 'random', description: 'Conversaciones aleatorias' },
    ];

    for (const channel of defaultChannels) {
      await prisma.channel.upsert({
        where: { name: channel.name },
        update: {},
        create: channel,
      });
    }
    console.log('✅ Canales creados correctamente');
  } catch (error) {
    console.log('⚠️ Seed omitido - los canales se pueden crear manualmente');
    console.log('   Error:', error.message);
  }
};

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Ejecutar seed DESPUÉS de iniciar (no bloquea)
  seedChannels();
});