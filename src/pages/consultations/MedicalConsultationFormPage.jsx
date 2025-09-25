import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/shadcn/button";
import { PageHeading } from "@/components/ui/typography/Heading";
import ConsultationForm from "@/components/consultations/ConsultationForm";
import { useCreateMedicalConsultation, useUpdateMedicalConsultation } from "@/hooks/useConsultations";
import { toast } from "sonner";

export default function MedicalConsultationFormPage({ editData }) {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});

  const createMut = useCreateMedicalConsultation();
  const updateMut = useUpdateMedicalConsultation(editData?.id);

  const handleSave = async (data) => {
    try {
      setServerErrors({});
      if (editData?.id) {
        await updateMut.mutateAsync(data);
        toast.success("Consulta médica actualizada");
      } else {
        await createMut.mutateAsync(data);
        toast.success("Consulta médica creada");
      }
      navigate(-1); // Regresa a la página anterior
    } catch (e) {
      setServerErrors(e?.data?.errors ?? {});
      toast.error(e?.data?.detail || "Error al guardar la consulta médica");
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto w-full min-w-0">
      <PageHeading
        title={editData ? "Editar consulta médica" : "Crear consulta médica"}
        subtitle={editData ? "Actualiza los datos de la consulta médica" : "Llena los datos para crear la consulta médica"}
      />

      <ConsultationForm
        defaultValues={{
          ...editData,
          patientName: editData?.patientName || "",
          doctorName: editData?.doctorName || "",
          centerName: editData?.centerName || "",
        }}
        onSubmit={handleSave}
        serverErrors={serverErrors}
        formId="consultation-form"
      />

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button type="submit" form="consultation-form">Guardar</Button>
      </div>
    </div>
  );
}
