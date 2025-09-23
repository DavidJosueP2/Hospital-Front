import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";

// Traer pacientes por centro con paginación
export const usePatientsPage = ({ centerId, page = 0, size = 10 }) => {
  return useQuery({
    queryKey: ["patients", centerId, page, size],
    queryFn: async () => {
      const res = await api.get("/consulting/patients", {
        params: { centerId, page, size },
      });
      return res.data;
    },
    keepPreviousData: true,
    enabled: !!centerId, // no correr si centerId es falsy
  });
};

// Traer un paciente
export const usePatient = ({ id }) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get(`/consulting/patients/${id}`);
      return res.data;
    },
    enabled: !!id, // solo corre si id existe
  });
};

// Crear paciente
export const useCreatePatient = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/consulting/patients", payload);
      return res.data;
    },
  });
};

// Actualizar paciente
export const useUpdatePatient = ({ id }) => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/consulting/patients/${id}`, payload);
      return res.data;
    },
  });
};

// Eliminar paciente
export const useDeletePatient = () => {
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/consulting/patients/${id}`);
      return true;
    },
  });
};
