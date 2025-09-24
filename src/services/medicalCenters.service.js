import api from "./api";

export const listCenters = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/centers", { params });
    return res.data;
};

export const listAllCenters = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/centers/all", { params: { includeDeleted } });
    return res.data;
};

export const getCenter = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/centers/${id}`, { params: { includeDeleted } });
    return { data: res.data };
};

export const createCenter = async (payload) => {
    const res = await api.post("/admin/centers", payload);
    return { data: res.data };
};

export const updateCenter = async (id, payload) => {
    const res = await api.put(`/admin/centers/${id}`, payload);
    return { data: res.data };
};

export const deleteCenter = async (id) => {
    await api.delete(`/admin/centers/${id}`);
    return true;
};

export const parseFieldErrors = (error) => {
    const errs = error?.data?.errors;
    if (!errs || typeof errs !== "object") return {};
    return errs;
};

export default {
    listCenters,
    listAllCenters,
    getCenter,
    createCenter,
    updateCenter,
    deleteCenter,
    parseFieldErrors,
};
