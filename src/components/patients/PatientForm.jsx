import React from "react";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";

export default function PatientForm({ value, onChange, centers = [], readOnly = false }) {

  const handleChange = (field, val) => {
    if (onChange) onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
	  <div>
		<Label className="mb-1 block">DNI</Label>
		<Input
		  value={value?.dni || ""}
		  onChange={(e) => handleChange("dni", e.target.value)}
		  disabled={readOnly}
		/>
	  </div>

	  <div>
		<Label className="mb-1 block">Nombre</Label>
		<Input
		  value={value?.firstName || ""}
		  onChange={(e) => handleChange("firstName", e.target.value)}
		  disabled={readOnly}
		/>
	  </div>

	  <div>
		<Label className="mb-1 block">Apellido</Label>
		<Input
		  value={value?.lastName || ""}
		  onChange={(e) => handleChange("lastName", e.target.value)}
		  disabled={readOnly}
		/>
	  </div>

      <div>
        <Label className="mb-1 block">Centro Médico</Label>
        <Select
          value={value?.centerId ? value.centerId.toString() : ""}
          onValueChange={(val) => handleChange("centerId", val)}
          disabled={readOnly}
        >
          <SelectTrigger
            className="h-12 px-3 py-2 border border-input bg-background text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring w-full"
          >
            <SelectValue placeholder="Seleccione un centro" />
          </SelectTrigger>
          <SelectContent>
            {centers.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1 block">Género</Label>
        <select
          className="h-12 px-3 py-2 border border-input bg-background text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring w-full"
          value={value?.gender || ""}
          onChange={e => handleChange("gender", e.target.value)}
          disabled={readOnly}
        >
          <option value="">Seleccione género</option>
          <option value="FEMALE">Femenino</option>
          <option value="MALE">Masculino</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>
      <div>
        <Label className="mb-1 block">Fecha de nacimiento</Label>
        <input
          type="date"
          className="h-12 px-3 py-2 border border-input bg-background text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring w-full"
          value={value?.birthDate || ""}
          onChange={e => handleChange("birthDate", e.target.value)}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
