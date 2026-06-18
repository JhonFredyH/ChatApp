import axios from "axios";

const api = axios.create({
  baseURL:         "http://localhost:3001/api",
  withCredentials: true, // necesario para que las cookies funcionen
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