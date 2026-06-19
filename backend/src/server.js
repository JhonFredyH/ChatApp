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

// CORS FLEXIBLE - Permite cualquier dominio de Vercel y localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (Postman, mobile apps, etc)
    if (!origin) {
      console.log('✅ CORS: Permitido (sin origin)');
      return callback(null, true);
    }

    // Lista de orígenes permitidos explícitamente
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    // Patrones permitidos (regex)
    const allowedPatterns = [
      /^https:\/\/.*\.vercel\.app$/,           // Cualquier dominio de Vercel
      /^https:\/\/chat-.*\.vercel\.app$/,     // Dominios que empiecen con "chat-"
      /^http:\/\/localhost:\d+$/,             // localhost con cualquier puerto
    ];

    // Verificar si está en la lista explícita
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Permitido (lista explícita) - ${origin}`);
      return callback(null, true);
    }

    // Verificar si coincide con algún patrón
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      console.log(`✅ CORS: Permitido (patrón) - ${origin}`);
      return callback(null, true);
    }

    // Si no coincide, bloquear
    console.log(`❌ CORS: Bloqueado - ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutos
};

// Aplicar CORS a Express
app.use(cors(corsOptions));

// Socket.io con CORS flexible
const io = new Server(server, {
  cors: corsOptions,
});

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/dms', dmRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: 'flexible'
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('✅ Usuario conectado:', socket.id);

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
    console.log('❌ Usuario desconectado:', socket.id);
  });
});

// Seed de canales (NO BLOQUEANTE)
const seedChannels = async () => {
  try {
    console.log('⏳ Intentando crear canales por defecto...');
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS: Flexible mode (permite cualquier dominio de Vercel)`);
  seedChannels();
});