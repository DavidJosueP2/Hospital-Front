import api from "./api";
import { setAccessToken, clearTokens } from "../utils/tokenStorage";

const baseUrl = import.meta.env.VITE_API_URL;

const authService = {
  // Login con DNI y contraseña
  login: async (identifier, password) => {
    try {
      const response = await api.post(`${baseUrl}/auth/login`, {
        username: identifier,
        password,
      });

      if (response.data?.token) {
        setAccessToken(response.data.token);
        return { success: true, ...response.data };
      }

      return { success: false, message: "No se recibió token válido" };
    } catch (err) {
      if (err.response?.status === 401) {
        return { success: false, message: "Credenciales inválidas" };
      }
      if (err.response) {
        return { success: false, message: "Error del servidor" };
      }
      return { success: false, message: "Error de red. Verifica tu conexión" };
    }
  },

  // Logout (solo cliente, no llama backend)
  logout: async () => {
    clearTokens();
    return { success: true };
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    const response = await api.get(`${baseUrl}/auth/users/me`);
    return response.data;
  },
};

export default authService;
