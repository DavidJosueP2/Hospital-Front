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

export const listCenters = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/centers", { params });
    return toCamel(res.data);
};

export const listAllCenters = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/centers/all", { params: { includeDeleted } });
    return toCamel(res.data);
};

export const getCenter = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/centers/${id}`, { params: { includeDeleted } });
    const etag = extractEtag(res.headers);
    if (etag) etagStore.set(id, etag);
    return { data: toCamel(res.data), etag };
};

export const createCenter = async (payload) => {
    const res = await api.post("/admin/centers", toSnake(payload));
    const data = toCamel(res.data);
    const etag = extractEtag(res.headers);
    if (etag && data?.id != null) etagStore.set(data.id, etag);
    return { data, etag };
};

export const updateCenter = async (id, payload, { ifMatch } = {}) => {
    const headers = { ...(ifMatch ? { "If-Match": ifMatch } : withIfMatch(id)) };
    const res = await api.put(`/admin/centers/${id}`, toSnake(payload), { headers });
    const data = toCamel(res.data);
    const etag = extractEtag(res.headers);
    if (etag) etagStore.set(id, etag);
    return { data, etag };
};

export const deleteCenter = async (id) => {
    await api.delete(`/admin/centers/${id}`);
    etagStore.delete(id);
    return true;
};

export const validateCenter = async (id) => {
    try {
        await api.get(`/admin/centers/validate/${id}`);
        return true;
    } catch (e) {
        if (e?.status === 404) return false;
        throw e;
    }
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
    listCenters,
    listAllCenters,
    getCenter,
    createCenter,
    updateCenter,
    deleteCenter,
    validateCenter,
    parseFieldErrors,
    getStoredEtag,
    setStoredEtag,
    clearStoredEtag,
};
