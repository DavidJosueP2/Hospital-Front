import React, { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/shadcn/dialog";
import DataTable from "@/components/ui/table/data-table";
import PatientForm from "@/components/patients/PatientForm";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { usePatientsPage, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatient";
import { PageHeading } from "@/components/ui/typography/Heading";
import PatientReadOnly from "@/components/patients/PatientReadOnly";

const centers = [
  { id: 1, name: "Centro Médico 1" },
  { id: 2, name: "Centro Médico 2" },
];

export default function PatientsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(1000000);
  const centerId = 1;

  // Función para resetear estados modales
  const resetModalStates = React.useCallback(() => {
    setEditForm({});
    setSelectedPatient(null);
    setServerErrors({});
  }, []);

  const { data, isLoading, isError, error, refetch } = usePatientsPage({
    centerId,
    page,
    size: pageSize,
  });

  const patients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalRecords = data?.totalElements ?? 0;

  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient({ id: editForm.id });
  const deleteMut = useDeletePatient();
const [confirmOpen, setConfirmOpen] = useState(false);
const [patientToDelete, setPatientToDelete] = useState(null);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "dni", header: "DNI" },
    { accessorKey: "firstName", header: "Nombre" },
    { accessorKey: "lastName", header: "Apellido" },
    {
      accessorKey: "gender",
      header: "Género",
      cell: ({ row }) =>
        row.original.gender === "FEMALE"
          ? "Femenino"
          : row.original.gender === "MALE"
          ? "Masculino"
          : "Otro",
    },
    {
      accessorKey: "birthDate",
      header: "Nacimiento",
      cell: ({ row }) =>
        row.original.birthDate
    ? new Date(row.original.birthDate).toLocaleDateString("es-EC", { timeZone: "UTC" })
    : ""
    },
    { accessorKey: "centerId", header: "Centro" },
  ];

  const rowActions = (row) => {
    const p = row.original;
    return (
      <div className="flex gap-1 justify-end">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => {
            resetModalStates();
            setSelectedPatient({...p});
            setViewOpen(true);
          }} 
          title="Ver"
        >
          <Eye className="size-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => {
            resetModalStates();
            setEditForm({...p});
            setFormOpen(true);
          }} 
          title="Editar"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            resetModalStates();
            setPatientToDelete({...p});
            setConfirmOpen(true);
          }}
          title="Eliminar"
>
  <Trash2 className="size-4 text-destructive" />
</Button>
      </div>
    );
  };

  const handleSave = async (data) => {
    try {
      setServerErrors({}); // Limpiar errores previos
      
      if (editForm.id) {
        await updateMut.mutateAsync({ ...data, id: editForm.id });
        toast.success("Paciente actualizado");
      } else {
        await createMut.mutateAsync({ ...data, centerId });
        toast.success("Paciente creado");
      }
      
      setFormOpen(false);
      setEditForm({});
      refetch();
    } catch (e) {
      console.log("Error capturado:", e); // Para debug
      
      // ✅ Verificar si el error viene con la estructura correcta del interceptor
      if (e?.data?.errors) {
        setServerErrors(e.data.errors);
        toast.error("Por favor corrige los errores en el formulario");
      } 
     
      // ✅ Error genérico
      else {
        toast.error(e?.data?.detail || "Error inesperado");
        setServerErrors({}); 
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeading
        title="Pacientes"
        subtitle="Crea, asocia, edita y administra pacientes"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => { setEditForm({}); setFormOpen(true); }}>
              <Plus className="mr-2 size-4" />
              Nuevo paciente
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div>Cargando pacientes...</div>
      ) : isError ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <DataTable
          columns={columns}
          data={patients}
          rowActions={rowActions}
          selectable
          searchable
          manualPagination
          pageCount={totalPages}
          state={{ pagination: { pageIndex: page, pageSize } }}
          onPaginationChange={({ pageIndex, pageSize: newSize }) => {
            setPage(pageIndex);
            setPageSize(newSize);
            refetch();
          }}
          emptyMessage="Sin datos"
        />
      )}

      {/* Modal Crear/Editar */}
      <Dialog 
        open={formOpen} 
        onOpenChange={(open) => {
          if (!open) {
            resetModalStates();
          }
          setFormOpen(open);
        }}
      >
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editForm.id ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
          </DialogHeader>
          <div key={editForm.id || 'new'}>
            <PatientForm
              defaultValues={editForm}
              onSubmit={handleSave}
              centers={centers}
              serverErrors={serverErrors}
              formId="patient-form"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => {
                resetModalStates();
                setFormOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" form="patient-form">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver */}
     <Dialog open={viewOpen} onOpenChange={setViewOpen}>
  <DialogContent className="max-w-lg w-full">
    <DialogHeader>
      <DialogTitle>Ver paciente</DialogTitle>
    </DialogHeader>
    <PatientReadOnly patient={selectedPatient} centers={centers} />
    <DialogFooter>
      <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* Modal Confirmar Eliminación */}
<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <DialogContent className="max-w-md w-full">
    <DialogHeader>
      <DialogTitle>Confirmar eliminación</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      {patientToDelete && (
        <p>
          ¿Estás seguro de eliminar al paciente{" "}
          <strong>{patientToDelete.firstName} {patientToDelete.lastName}</strong>?
        </p>
      )}
    </div>
    <DialogFooter>
      <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
        Cancelar
      </Button>
      <Button
        variant="destructive"
        onClick={async () => {
          try {
            await deleteMut.mutateAsync(patientToDelete.id);
            toast.success("Paciente eliminado");
            setConfirmOpen(false);
            setPatientToDelete(null);
            refetch();
          } catch (e) {
            toast.error(e?.message || "Error eliminando paciente");
          }
        }}
      >
        Eliminar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
