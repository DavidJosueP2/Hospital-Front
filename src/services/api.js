import axios from "axios";
import { getAccessToken, clearTokens } from "@/utils/tokenStorage";

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró (401), limpiar tokens y redirigir al login
    if (error.response?.status === 401) {
      clearTokens();
      window.location.href = "/login";
    }

    // Si es un error de red
    if (!error.response) {
      console.error("Error de red:", error.message);
      return Promise.reject({
        message: "Error de conexión. Verifica tu internet.",
        type: "network",
      });
    }

    // Imprimir detalles completos del error para diagnóstico
    console.log("Error completo de la API:", {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      config: {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
      },
    });

    // ✅ Manejo específico para errores de validación (400)
    if (error.response.status === 400 && error.response.data?.errors) {
      return Promise.reject({
        message: error.response.data?.message || error.response.data?.detail || "Errores de validación",
        status: error.response.status,
        data: error.response.data, // ✅ Preservar toda la estructura
        type: "validation",
      });
    }

    // Extraer mensaje de error del servidor
    let errorMessage =
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.error ||
      "Ha ocurrido un error inesperado";

    // Manejo específico para código 409 (Conflict)
    if (error.response.status === 409 && !errorMessage) {
      errorMessage = "Error de conflicto.";
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      data: error.response.data, // ✅ Preservar los datos completos
    });
  }
);

export default api;