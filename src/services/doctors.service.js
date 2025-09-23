import api from "./api";

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const toSnake = (obj) => {
    if (Array.isArray(obj)) return obj.map(toSnake);
    if (!isObject(obj)) return obj;
    return Object.keys(obj).reduce((acc, key) => {
        const s = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
        acc[s] = toSnake(obj[key]);
        return acc;
    }, {});
};

const toCamel = (obj) => {
    if (Array.isArray(obj)) return obj.map(toCamel);
    if (!isObject(obj)) return obj;
    return Object.keys(obj).reduce((acc, key) => {
        const c = key.replace(/_([a-z])/g, (_, g1) => g1.toUpperCase());
        acc[c] = toCamel(obj[key]);
        return acc;
    }, {});
};

export const listDoctors = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/doctors", { params });
    return toCamel(res.data);
};

export const listAllDoctors = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/doctors/all", { params: { includeDeleted } });
    return toCamel(res.data);
};

export const getDoctor = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/doctors/${id}`, { params: { includeDeleted } });
    return { data: toCamel(res.data) };
};

export const getDoctorByUser = async (userId) => {
    const res = await api.get(`/admin/doctors/by-user/${userId}`);
    return { data: toCamel(res.data) };
};

export const listDoctorsBySpecialty = async (specialtyId, { page = 0, size = 10, sort } = {}) => {
    const params = { page, size };
    if (sort) params.sort = sort;
    const res = await api.get(`/admin/doctors/by-specialty/${specialtyId}`, { params });
    return toCamel(res.data);
};

export const createDoctor = async (payload) => {
    const res = await api.post("/admin/doctors", toSnake(payload));
    return { data: toCamel(res.data) };
};

export const registerDoctor = async (payload) => {
    const res = await api.post("/admin/doctors/register", toSnake(payload));
    return { data: toCamel(res.data) };
};

export const updateDoctor = async (id, payload) => {
    const res = await api.put(`/admin/doctors/${id}`, toSnake(payload));
    return { data: toCamel(res.data) };
};

export const deleteDoctor = async (id) => {
    await api.delete(`/admin/doctors/${id}`);
    return true;
};

export const parseFieldErrors = (error) => {
    const errs = error?.data?.errors;
    if (!errs || typeof errs !== "object") return {};
    return toCamel(errs);
};

export default {
    listDoctors,
    listAllDoctors,
    getDoctor,
    getDoctorByUser,
    listDoctorsBySpecialty,
    createDoctor,
    registerDoctor,
    updateDoctor,
    deleteDoctor,
    parseFieldErrors,
};
