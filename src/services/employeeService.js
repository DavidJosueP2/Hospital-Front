import api from "./api"; // tu wrapper de fetch/axios

const employees = {
  async listEmployees({ page = 0, size = 10, sort = "id,asc" }) {
    const res = await api.get("/auth/users", {
      params: { page, size, sort },
    });
    console.log(res.data);
    return res.data;
  },
};

export default employees;
