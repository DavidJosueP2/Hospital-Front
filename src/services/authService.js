import api from "./api";
import { setAccessToken, clearTokens } from "../utils/tokenStorage";

const baseUrl = import.meta.env.VITE_API_URL;

const authService = {
  // Login con DNI y contraseña
  login: async (identifier, password) => {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: identifier,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Caso: credenciales inválidas (401)
        if (response.status === 401) {
          return {
            success: false,
            message: data.message || "Credenciales inválidas",
          };
        }

        // Otros errores del servidor
        return {
          success: false,
          message: data.message || "Error en el servidor",
        };
      }

      // Caso: login exitoso
      if (data?.token) {
        setAccessToken(data.token);
        return { success: true, ...data };
      }

      return { success: false, message: "No se recibió token válido" };
    } catch (err) {
      console.error("Error en login (fetch):", err);
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
