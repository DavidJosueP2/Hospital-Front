import api from "./api";

export const listDoctors = async ({ includeDeleted = false, page = 0, size = 10, sort } = {}) => {
    const params = { includeDeleted, page, size };
    if (sort) params.sort = sort;
    const res = await api.get("/admin/doctors", { params });
    return res.data;
};

export const listAllDoctors = async ({ includeDeleted = false } = {}) => {
    const res = await api.get("/admin/doctors/all", { params: { includeDeleted } });
    return res.data;
};

export const getDoctor = async (id, { includeDeleted = false } = {}) => {
    const res = await api.get(`/admin/doctors/${id}`, { params: { includeDeleted } });
    return { data: res.data };
};

export const getDoctorByUser = async (userId) => {
    const res = await api.get(`/admin/doctors/by-user/${userId}`);
    return { data: res.data };
};

export const listDoctorsBySpecialty = async (specialtyId, { page = 0, size = 10 } = {}) => {
    const res = await api.get(`/admin/doctors/by-specialty/${specialtyId}`, { params: { page, size } });
    return res.data;
};

export const createDoctor = async ({ userId, specialtyId }) => {
    const payload = { user_id: userId, specialty_id: specialtyId };
    const res = await api.post("/admin/doctors", payload);
    return { data: res.data };
};

export const registerDoctor = async ({
                                         username,
                                         email,
                                         password,
                                         gender,
                                         firstName,
                                         lastName,
                                         centerId,
                                         specialtyId,
                                     }) => {
    const payload = {
        username,
        email,
        password,
        gender,
        first_name: firstName,
        last_name: lastName,
        center_id: centerId,
        specialty_id: specialtyId,
    };
    const res = await api.post("/admin/doctors/register", payload);
    return { data: res.data };
};

export const updateDoctor = async (id, { userId, specialtyId } = {}) => {
    const payload = {};
    if (userId != null) payload.user_id = userId;
    if (specialtyId != null) payload.specialty_id = specialtyId;
    const res = await api.put(`/admin/doctors/${id}`, payload);
    return { data: res.data };
};

export const deleteDoctor = async (id) => {
    await api.delete(`/admin/doctors/${id}`);
    return true;
};

export const parseFieldErrors = (error) => {
    const errs = error?.data?.errors;
    if (!errs || typeof errs !== "object") return {};
    return errs;
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
