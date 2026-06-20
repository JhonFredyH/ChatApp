import axios from "axios";

const DEFAULT_API = 'https://chatapp-backend-82sc.onrender.com/api';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API,
  withCredentials: true,
});

// Agregar Authorization automáticamente desde localStorage cuando exista
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // No bloquear si localStorage no está disponible
  }
  return config;
});

// Si el token expira, reintenta automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 &&
        error.response?.data?.code === "TOKEN_EXPIRED" &&
        !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;