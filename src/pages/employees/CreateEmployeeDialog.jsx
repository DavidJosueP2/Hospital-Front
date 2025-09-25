import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { toast } from "sonner";
import employees from "@/services/employeeService";

export default function CreateEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    gender: "MALE",
    firstName: "",
    lastName: "",
    center_id: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    setLoading(true);
    try {
      await employees.createEmployee(form);
      toast.success("Empleado creado con rol ADMIN");
      onSuccess?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo empleado</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input name="username" placeholder="DNI" onChange={handleChange} />
          <Input name="email" placeholder="Correo" onChange={handleChange} />
          <Input
            name="password"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
          />
          <Input
            name="firstName"
            placeholder="Nombre"
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="Apellido"
            onChange={handleChange}
          />
          <Input
            name="center_id"
            placeholder="ID del Centro"
            onChange={handleChange}
          />
        </div>
        <Button onClick={submit} disabled={loading} className="mt-4 w-full">
          {loading ? "Creando..." : "Crear"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
