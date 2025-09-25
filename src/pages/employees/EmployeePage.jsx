import React from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { Loader2 } from "lucide-react";
import DataTable from "@/components/ui/table/data-table";
import { PageHeading } from "@/components/ui/typography/Heading";
import employees from "@/services/employeeService";

// columnas para la tabla
const columns = [
  {
    accessorKey: "id",
    header: "ID",
    size: 72,
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
    accessorKey: "centerId",
    header: "Centro ID",
    cell: ({ row }) => row.original.center_name ?? "—",
  },
];

export default function EmployeesPage() {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState("id,asc");

  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employees.listEmployees({
        page: pageIndex,
        size: pageSize,
        sort,
      });
      setRows(data.content ?? []);
      setTotal(data.totalElements ?? 0);
      setPageCount(data.totalPages ?? 0);
    } catch (e) {
      setError(e?.message || "Error");
      toast.error(e?.message || "Error");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Empleados"
        subtitle="Visualiza y administra empleados"
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            initialPageSize={pageSize}
            searchable={false}
            selectable={false}
            emptyMessage={
              isLoading ? "Cargando..." : error ? error : "Sin datos"
            }
            className="[&_th]:py-2 [&_td]:py-2"
            serverPagination={{
              pageIndex,
              pageSize,
              pageCount,
              onPageChange: setPageIndex,
              onPageSizeChange: (s) => {
                setPageSize(s);
                setPageIndex(0);
              },
            }}
            serverSorting={{
              sort,
              onSortChange: (s) => {
                setSort(s);
                setPageIndex(0);
              },
            }}
          />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Total: {total}
          <Separator className="mx-3 h-4" orientation="vertical" />
          Página {pageIndex + 1} de {Math.max(pageCount, 1)}
          <Separator className="mx-3 h-4" orientation="vertical" />
          <Button variant="ghost" size="sm" onClick={load} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Refrescar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
