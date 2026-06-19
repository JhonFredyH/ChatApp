import { io } from "socket.io-client";

// URL del socket: usa variable de entorno en producción, localhost en desarrollo
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://chatapp-backend-82sc.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // conectar manualmente al hacer login
  transports: ['websocket', 'polling'],
});

export default socket;