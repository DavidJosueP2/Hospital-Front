import api from "./api";

export const listSpecialties = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/specialties", { params });
    return res.data;
};

export const listAllSpecialties = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/specialties/all", { params: { includeDeleted } });
    return res.data;
};

export const getSpecialty = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/specialties/${id}`, { params: { includeDeleted } });
    return { data: res.data };
};

export const createSpecialty = async (payload) => {
    const res = await api.post("/admin/specialties", payload);
    return { data: res.data };
};

export const updateSpecialty = async (id, payload) => {
    const res = await api.put(`/admin/specialties/${id}`, payload);
    return { data: res.data };
};

export const deleteSpecialty = async (id) => {
    await api.delete(`/admin/specialties/${id}`);
    return true;
};

export const parseFieldErrors = (error) => {
    const errs = error?.data?.errors;
    if (!errs || typeof errs !== "object") return {};
    return errs;
};

export default {
    listSpecialties,
    listAllSpecialties,
    getSpecialty,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    parseFieldErrors,
};
