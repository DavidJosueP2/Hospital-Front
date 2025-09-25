import api from "./api"; // tu wrapper de fetch/axios

const employees = {
  async listEmployees({ page = 0, size = 10, includeDeleted = false }) {
    const res = await api.get("/auth/users", {
      params: {
        page,
        size,
        includeDeleted,
      },
    });
    return res.data;
  },

  async deleteEmployee(id, hard = false) {
    const res = await api.delete(`/auth/${id}`, {
      params: { hard },
    });
    return res.data;
  },
};

export default employees;
