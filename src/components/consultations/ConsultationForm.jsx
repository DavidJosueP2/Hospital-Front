import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";

export default function ConsultationForm({ defaultValues, onSubmit, readOnly = false, serverErrors = {}, formId }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      patientId: "",
      patientName: "",
      doctorId: "",
      doctorName: "",
      centerId: "",
      centerName: "",
      date: "",
      diagnosis: "",
      treatment: "",
      notes: "",
    },
    mode: "onChange",
  });

  // Mapear errores del backend a react-hook-form
  useEffect(() => {
    clearErrors();
    if (serverErrors && typeof serverErrors === "object") {
      Object.entries(serverErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field, { type: "server", message: messages[0] });
        }
      });
    }
  }, [serverErrors, setError, clearErrors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id={formId}>
      <div className="grid grid-cols-2 gap-4">
      
        {/* Centro */}
        <div>
          <Label className="mb-3">Centro Médico</Label>
          <Input {...register("centerName")} disabled />
          <input type="hidden" {...register("centerId")} />
        </div>


        {/* Doctor */}
        <div>
          <Label className="mb-3">Doctor</Label>
          <Input {...register("doctorName")} disabled />
          <input type="hidden" {...register("doctorId")} />
        </div>

        {/* Paciente */}
  <div>
          <Label className="mb-3">Paciente</Label>
          <Input {...register("patientName")} disabled />
          <input type="hidden" {...register("patientId")} />
        </div>

        {/* Fecha y hora */}
        <div>
          <Label className="mb-3">Fecha y hora</Label>
          <Input type="datetime-local" {...register("date", { required: "Seleccione fecha y hora" })} disabled={readOnly} />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <Label className="mb-3">Diagnóstico</Label>
        <Textarea {...register("diagnosis", { required: "El diagnóstico es obligatorio" })} disabled={readOnly} />
        {errors.diagnosis && <p className="text-sm text-red-500">{errors.diagnosis.message}</p>}
      </div>

      {/* Treatment */}
      <div>
        <Label className="mb-3">Tratamiento</Label>
        <Textarea {...register("treatment")} disabled={readOnly} />
        {errors.treatment && <p className="text-sm text-red-500">{errors.treatment.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <Label className="mb-3">Notas</Label>
        <Textarea {...register("notes")} disabled={readOnly} />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
      </div>
    </form>
  );
}
