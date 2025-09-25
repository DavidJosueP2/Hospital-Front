import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/shadcn/button";
import DataTable from "@/components/ui/table/data-table-pb";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { PageHeading } from "@/components/ui/typography/Heading";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Datos dummy
const dummyData = [
  {
    id: 1,
    patientName: "Juan Pérez",
    date: "2025-09-21T17:00:00",
    diagnosis: "Gripe común",
    treatment: "Reposo y líquidos abundantes",
    notes: "Paciente con fiebre y tos. Debe tomar paracetamol y mantenerse hidratado.",
  },
  {
    id: 2,
    patientName: "María López",
    date: "2025-09-22T10:30:00",
    diagnosis: "Dolor de garganta",
    treatment: "Gárgaras con agua tibia y miel",
    notes: "Se recomienda evitar comidas muy frías y mantener reposo vocal.",
  },
];

export default function MedicalConsultationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Función para truncar textos largos
  const truncateText = (text, maxLength = 30) =>
    text.length > maxLength ? text.substring(0, maxLength) + "…" : text;

  const columns = [
    { accessorKey: "patientName", header: "Paciente" },
    { 
      accessorKey: "date", 
      header: "Fecha", 
      cell: ({ row }) => new Date(row.original.date).toLocaleString("es-EC") 
    },
    { 
      accessorKey: "diagnosis", 
      header: "Diagnóstico",
      cell: ({ row }) => truncateText(row.original.diagnosis)
    },
    { 
      accessorKey: "treatment", 
      header: "Tratamiento",
      cell: ({ row }) => truncateText(row.original.treatment)
    },
    { 
      accessorKey: "notes", 
      header: "Notas",
      cell: ({ row }) => truncateText(row.original.notes)
    },
  ];

  const rowActions = (row) => {
    const consultation = row.original;
    return (
      <div className="flex gap-1 justify-end">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => navigate(`/medical-consultations/view/${consultation.id}`)}
          title="Ver"
        >
          <Eye className="size-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => navigate(`/medical-consultations/edit/${consultation.id}`)}
          title="Editar"
        >
          <Pencil className="size-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => toast.error("Función de eliminar no implementada")}
          title="Eliminar"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    );
  };

  const handlePaginationChange = ({ pageIndex, pageSize: newPageSize }) => {
    if (pageIndex !== page || newPageSize !== pageSize) {
      setPage(pageIndex);
      setPageSize(newPageSize);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeading
        title="Consultas Médicas"
        subtitle="Crea, edita y administra consultas médicas"
        actions={
          <Button onClick={() => navigate("/consultations/form")}>
            <Plus className="mr-2 size-4" />
            Nueva consulta
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={dummyData}
        rowActions={rowActions}
        manualPagination={true}
        pageCount={1} // Solo dummy
        totalRows={dummyData.length}
        state={{
          pagination: {
            pageIndex: page,
            pageSize: pageSize,
          },
        }}
        onPaginationChange={handlePaginationChange}
        emptyMessage="Sin datos"
        searchable={false}
      />
    </div>
  );
}
