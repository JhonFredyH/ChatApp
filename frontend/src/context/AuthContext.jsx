import { createContext, useState, useEffect } from "react";
import { authService } from "../lib/authService.js";
import socket from "../lib/socket.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.userId });
          // Reconectar socket si hay sesión activa
          socket.connect();
          socket.emit("user:join", payload.userId);
        } else {
          authService.logout();
        }
      } catch {
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    // Conectar socket al hacer login
    socket.connect();
    socket.emit("user:join", data.user.id);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data.user);
    // Conectar socket al registrarse
    socket.connect();
    socket.emit("user:join", data.user.id);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    socket.disconnect();
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}