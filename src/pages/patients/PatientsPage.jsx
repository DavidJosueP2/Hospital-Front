import React, { useState, useCallback, useEffect } from "react";
import { useCenter } from "@/hooks/useMedicalCenters";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/shadcn/dialog";
import DataTable from "@/components/ui/table/data-table-pb";
import PatientForm from "@/components/patients/PatientForm";
import PatientReadOnly from "@/components/patients/PatientReadOnly";
import { PageHeading } from "@/components/ui/typography/Heading";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { usePatientsPage, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatient";
import { getUserCenterId } from "@/utils/auth";


export default function PatientsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  

const centerId = getUserCenterId();

console.log(getUserCenterId());

  const { data, isLoading, isError, error, refetch } = usePatientsPage({ 
    centerId, 
    page, 
    size: pageSize 
  });


const { data: centerData } = useCenter(centerId);
const centers = centerData ? [centerData.data] : []; 
  const patientsList = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient(editForm.id);
  const deleteMut = useDeletePatient();

  const resetModalStates = useCallback(() => {
    setEditForm({});
    setSelectedPatient(null);
    setServerErrors({});
    setPatientToDelete(null);
  }, []);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "dni", header: "DNI" },
    { accessorKey: "firstName", header: "Nombre" },
    { accessorKey: "lastName", header: "Apellido" },
    { 
      accessorKey: "gender", 
      header: "Género", 
      cell: ({ row }) => 
        row.original.gender === "FEMALE" ? "Femenino" : 
        row.original.gender === "MALE" ? "Masculino" : "Otro"
    },
    { 
      accessorKey: "birthDate", 
      header: "Nacimiento", 
      cell: ({ row }) => 
        row.original.birthDate ? new Date(row.original.birthDate).toLocaleDateString("es-EC") : ""
    },
  {
  accessorKey: "centerId",
  header: "Centro",
  cell: () => centerData?.data?.name ?? "—",
},

  ];

  const rowActions = (row) => {
    const p = row.original;
    return (
      <div className="flex gap-1 justify-end">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => { 
            setSelectedPatient(p); 
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
            setEditForm(p); 
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
            setPatientToDelete(p); 
            setConfirmOpen(true); 
          }} 
          title="Eliminar"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    );
  };

  const handlePaginationChange = ({ pageIndex, pageSize: newPageSize }) => {
    // Solo actualizar los valores si han cambiado
    if (pageIndex !== page || newPageSize !== pageSize) {
      setPage(pageIndex);
      setPageSize(newPageSize);
      // El refetch se ejecutará automáticamente cuando cambien page o pageSize
      // gracias a las dependencias del hook usePatientsPage
    }
  };

const handleSave = async (data) => {
  try {
    console.log(data);
    setServerErrors({});
    if (editForm.id) {
      await updateMut.mutateAsync(data);
      toast.success("Paciente actualizado");
    } else {
      await createMut.mutateAsync(data); 
      toast.success("Paciente creado");
    }
    setFormOpen(false);
    resetModalStates();
    refetch();
  } catch (e) {
    setServerErrors(e?.data?.errors ?? {});
    toast.error(e?.data?.detail || "Error");
  }
};


  return (
    <div className="space-y-6 p-6">
      <PageHeading
        title="Pacientes"
        subtitle="Crea, edita y administra pacientes"
        actions={
          <Button onClick={() => { 
            resetModalStates(); 
            setFormOpen(true); 
          }}>
            <Plus className="mr-2 size-4" />
            Nuevo paciente
          </Button>
        }
      />

      {isLoading ? (
        <div>Cargando pacientes...</div>
      ) : isError ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <DataTable
          columns={columns}
          data={patientsList}
          rowActions={rowActions}
          manualPagination={true}
          pageCount={totalPages}
          totalRows={totalElements}
          state={{
            pagination: {
              pageIndex: page,
              pageSize: pageSize,
            },
          }}
          onPaginationChange={handlePaginationChange}
          emptyMessage="Sin datos"
          searchable={false} // Desactivar búsqueda local ya que es paginación del servidor
        />
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={formOpen} onOpenChange={(o) => { 
        if (!o) resetModalStates(); 
        setFormOpen(o); 
      }}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              {editForm.id ? "Editar paciente" : "Nuevo paciente"}
            </DialogTitle>
          </DialogHeader>
          <PatientForm 
            defaultValues={editForm} 
            onSubmit={handleSave} 
            centers={centers} 
            serverErrors={serverErrors} 
            formId="patient-form"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-form">
              Guardar
            </Button>
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
          {patientToDelete && (
            <p className="py-4">
              ¿Eliminar a {patientToDelete.firstName} {patientToDelete.lastName}?
            </p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await deleteMut.mutateAsync(patientToDelete.id);
                toast.success("Paciente eliminado");
                setConfirmOpen(false);
                resetModalStates();
                refetch();
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