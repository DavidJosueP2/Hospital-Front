// passwordService.js
import api from "./api";
const baseUrl = import.meta.env.VITE_API_URL;

const passwordService = {
  requestReset: async (input) => {
    const response = await api.post(`${baseUrl}/auth/request-reset`, { input });
    return response.data;
  },

  reset: async (token, newPassword) => {
    const response = await api.post(`${baseUrl}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default passwordService;
