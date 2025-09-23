import api from "./api";

const etagStore = new Map();

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

const extractEtag = (headers) => {
    const raw = headers?.etag || headers?.ETag;
    if (!raw) return undefined;
    return raw;
};

const withIfMatch = (id, extra = {}) => {
    const etag = etagStore.get(id);
    if (!etag) throw { message: "Missing ETag. Load the resource before updating.", status: 409 };
    return { ...extra, "If-Match": etag };
};

export const listSpecialties = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/specialties", { params });
    return toCamel(res.data);
};

export const listAllSpecialties = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/specialties/all", { params: { includeDeleted } });
    return toCamel(res.data);
};

export const getSpecialty = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/specialties/${id}`, { params: { includeDeleted } });
    const etag = extractEtag(res.headers);
    if (etag) etagStore.set(id, etag);
    return { data: toCamel(res.data), etag };
};

export const createSpecialty = async (payload) => {
    const res = await api.post("/admin/specialties", toSnake(payload));
    const data = toCamel(res.data);
    const etag = extractEtag(res.headers);
    if (etag && data?.id != null) etagStore.set(data.id, etag);
    return { data, etag };
};

export const updateSpecialty = async (id, payload, { ifMatch } = {}) => {
    const headers = { ...(ifMatch ? { "If-Match": ifMatch } : withIfMatch(id)) };
    const res = await api.put(`/admin/specialties/${id}`, toSnake(payload), { headers });
    const data = toCamel(res.data);
    const etag = extractEtag(res.headers);
    if (etag) etagStore.set(id, etag);
    return { data, etag };
};

export const deleteSpecialty = async (id) => {
    await api.delete(`/admin/specialties/${id}`);
    etagStore.delete(id);
    return true;
};

export const parseFieldErrors = (error) => {
    const errs = error?.data?.errors;
    if (!errs || typeof errs !== "object") return {};
    return toCamel(errs);
};

export const getStoredEtag = (id) => etagStore.get(id);
export const setStoredEtag = (id, etag) => etagStore.set(id, etag);
export const clearStoredEtag = (id) => etagStore.delete(id);

export default {
    listSpecialties,
    listAllSpecialties,
    getSpecialty,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    parseFieldErrors,
    getStoredEtag,
    setStoredEtag,
    clearStoredEtag,
};
