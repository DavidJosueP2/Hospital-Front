import React, { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/shadcn/dialog";
import DataTable from "@/components/ui/table/data-table";
import PatientForm from "@/components/patients/PatientForm";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { usePatientsPage, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatient";

// Puedes cambiar el centerId aquí o hacerlo dinámico según tu app
const centerId =1;
const centers = [
  { id: 1, name: "Centro Médico 1" },
  { id: 2, name: "Centro Médico 2" },
];

export default function PatientsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Hooks backend
  const { data, isLoading, isError, error, refetch } = usePatientsPage({ centerId, page, size: pageSize });
  const patients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient({ id: editForm.id });
  const deleteMut = useDeletePatient();

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "dni", header: "DNI" },
    { accessorKey: "firstName", header: "Nombre" },
    { accessorKey: "lastName", header: "Apellido" },
    { accessorKey: "gender", header: "Género", cell: ({ row }) => row.original.gender === "FEMALE" ? "Femenino" : row.original.gender === "MALE" ? "Masculino" : "Otro" },
    { accessorKey: "birthDate", header: "Nacimiento", cell: ({ row }) => row.original.birthDate ? new Date(row.original.birthDate).toLocaleDateString() : "" },
    { accessorKey: "centerId", header: "Centro" },
  ];

  const rowActions = (row) => {
    const p = row.original;
    return (
      <div className="flex gap-1 justify-end">
        <Button size="icon" variant="ghost" onClick={() => { setSelectedPatient(p); setViewOpen(true); }} title="Ver">
          <Eye className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => { setEditForm(p); setFormOpen(true); }} title="Editar">
          <Pencil className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={async () => {
          try {
            await deleteMut.mutateAsync(p.id);
            toast.success("Paciente eliminado");
            refetch();
          } catch (e) {
            toast.error(e?.message || "Error eliminando paciente");
          }
        }} title="Eliminar">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      if (editForm.id) {
        await updateMut.mutateAsync(editForm);
        toast.success("Paciente actualizado");
      } else {
        await createMut.mutateAsync({ ...editForm, centerId });
        toast.success("Paciente creado");
      }
      setFormOpen(false);
      setEditForm({});
      refetch();
    } catch (e) {
      toast.error(e?.message || "Error");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado tipo Centros Médicos */}
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-sky-400 leading-tight">Pacientes</h1>
            <div className="text-muted-foreground text-base mt-1">Gestión de Pacientes</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setEditForm({}); setFormOpen(true); }}>
              + Nuevo paciente
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        rowActions={rowActions}
        emptyMessage={isLoading ? "Cargando..." : isError ? (error?.message || "Error") : "No hay pacientes"}
        serverPagination={{
          pageIndex: page,
          pageSize,
          pageCount: totalPages,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(0);
          },
        }}
      />

      {/* Modal Crear/Editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editForm.id ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
          </DialogHeader>
          <PatientForm value={editForm} onChange={setEditForm} centers={centers} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Ver paciente</DialogTitle>
          </DialogHeader>
          <PatientForm value={selectedPatient || {}} readOnly centers={centers} />
          <DialogFooter>
            <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
