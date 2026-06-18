import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  withCredentials: true,
  autoConnect:     false, // conectar manualmente al hacer login
});

export default socket;