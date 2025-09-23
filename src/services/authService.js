import api from "./api";

const baseUrl = import.meta.env.VITE_API_URL;

const authService = {
  // Login con DNI y contraseña
  login: async (dni, password) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: dni, password }),
    });
    return await response.json();
  },

  // Logout (solo cliente, no llama backend)
  logout: async () => {
    return { success: true };
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    const response = await api.get(`${baseUrl}/auth/users/me`);
    return response.data;
  },
};

export default authService;
