import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";

// Traer pacientes por centro con paginación
export const usePatientsPage = ({ centerId, page = 0, size = 13 }) => {
  return useQuery({
    queryKey: ["patients", centerId, page, size],
    queryFn: async () => {
      const res = await api.get("/api/consulting/patients", {
        params: { centerId, page, size },
      });
      console.log("📦 Datos crudos del backend:", res.data); // 👈 aquí
      return res.data;
    },
    keepPreviousData: true,
    enabled: !!centerId,
  });
};

// Buscar pacientes por DNI, nombre o apellido
export const useSearchPatients = ({ search }) => {
  return useQuery({
    queryKey: ["patients", "search", search],
    queryFn: async () => {
      if (!search) return [];
      const res = await api.get("/api/consulting/patients/search", {
        params: { search },
      });
      console.log("🔍 Resultados de búsqueda:", res.data);
      return res.data;
    },
    enabled: !!search,
  });
};

// Traer un paciente
export const usePatient = ({ id }) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get(`/api/consulting/patients/${id}`);
      return res.data;
    },
    enabled: !!id, // solo corre si id existe
  });
};

// Crear paciente
export const useCreatePatient = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/api/consulting/patients", payload);
      return res.data;
    },
  });
};

// Actualizar paciente
export const useUpdatePatient = ({ id }) => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/api/consulting/patients/${id}`, payload);
      return res.data;
    },
  });
};

// Eliminar paciente
export const useDeletePatient = () => {
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/consulting/patients/${id}`);
      return true;
    },
  });
};
