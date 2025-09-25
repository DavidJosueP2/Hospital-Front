import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { Loader2, Trash2 } from "lucide-react";
import DataTable from "@/components/ui/table/data-table-pb";
import { PageHeading } from "@/components/ui/typography/Heading";
import employees from "@/services/employeeService";
import CreateEmployeeDialog from "@/components/employees/CreateEmployeeDialog";

const columns = (onDelete) => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span>,
  },
  {
    id: "user",
    header: "Usuario",
    cell: ({ row }) => {
      const d = row.original;
      const title = d.gender === "FEMALE" ? "Sra." : "Sr.";
      const fullName =
        [d.firstName, d.lastName].filter(Boolean).join(" ") || d.username;
      return (
        <div className="leading-snug">
          <div className="font-medium">
            {title} {fullName}
          </div>
          <div className="text-xs text-muted-foreground">C.I. {d.username}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => row.original.email || "—",
  },
  {
    accessorKey: "center_name",
    header: "Centro",
    cell: ({ row }) => row.original.center_name || "—",
  },
  {
    accessorKey: "enabled",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={
          row.original.enabled
            ? "text-green-600 font-medium"
            : "text-red-600 font-medium"
        }
      >
        {row.original.enabled ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const d = row.original;
      const disabled = !d.enabled;

      return (
        <Button
          size="icon"
          variant="ghost"
          title={disabled ? "Empleado inactivo" : "Deshabilitar"}
          onClick={() => !disabled && onDelete(d)}
          disabled={disabled}
        >
          <Trash2
            className={`size-4 ${
              disabled ? "text-muted-foreground" : "text-destructive"
            }`}
          />
        </Button>
      );
    },
  },
];

export default function EmployeesPage() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  const [rows, setRows] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deletePending, setDeletePending] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employees.listEmployees({
        page,
        size: pageSize,
        includeDeleted,
      });
      setRows(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, includeDeleted]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handlePaginationChange = ({ pageIndex, pageSize: newPageSize }) => {
    if (pageIndex !== page || newPageSize !== pageSize) {
      setPage(pageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleDelete = async (employee) => {
    if (!confirm(`¿Eliminar empleado ID ${employee.id}?`)) return;
    setDeletePending(true);
    try {
      await employees.deleteEmployee(employee.id);
      toast.success("Empleado eliminado", {
        description: `ID ${employee.id}`,
      });
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail || e?.message || "Error al eliminar";
      toast.error(msg);
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeading
        title="Empleados"
        subtitle="Visualiza empleados o eliminalos."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>Nuevo empleado</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIncludeDeleted((v) => !v);
                setPage(0);
              }}
            >
              {includeDeleted
                ? "Ocultar deshabilitados"
                : "Mostrar deshabilitados"}
            </Button>
          </div>
        }
      />

      <CreateEmployeeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={load}
      />

      <div className="rounded-xl border bg-card">
        <div className="p-4">
          <DataTable
            columns={columns(handleDelete)}
            data={rows}
            manualPagination={true}
            pageCount={Math.max(totalPages, 1)}
            totalRows={totalElements}
            state={{ pagination: { pageIndex: page, pageSize } }}
            onPaginationChange={handlePaginationChange}
            emptyMessage={
              isLoading ? "Cargando..." : error ? error : "Sin datos"
            }
            searchable={false}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
          <div>
            Total: {totalElements}
            <Separator
              className="mx-3 h-4 inline-block align-middle"
              orientation="vertical"
            />
            Página {page + 1} de {Math.max(totalPages, 1)}
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Refrescar
          </Button>
        </div>
      </div>
    </div>
  );
}
