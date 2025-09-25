import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/shadcn/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/shadcn/alert-dialog";
import DataTable from "@/components/ui/table/data-table";
import { PageHeading } from "@/components/ui/typography/Heading";
import { Plus, Trash2 } from "lucide-react";
import EmployeeForm from "@/components/employees/EmployeeForm";

const columns = [
  { accessorKey: "username", header: "DNI" },
  { accessorKey: "email", header: "Correo" },
  { accessorKey: "firstName", header: "Nombre" },
  { accessorKey: "lastName", header: "Apellido" },
  { accessorKey: "gender", header: "Género" },
  { accessorKey: "centerName", header: "Centro" },
];

export default function EmployeesPage() {
  // --- datos estáticos para probar ---
  const rows = [
    {
      id: 1,
      username: "0912345678",
      email: "juan@example.com",
      firstName: "Juan",
      lastName: "Pérez",
      gender: "MALE",
      centerName: "Centro Norte",
    },
    {
      id: 2,
      username: "0923456789",
      email: "maria@example.com",
      firstName: "María",
      lastName: "López",
      gender: "FEMALE",
      centerName: "Centro Sur",
    },
  ];

  const [createOpen, setCreateOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState(null);

  const openCreate = () => setCreateOpen(true);
  const openDelete = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const rowActions = (row) => (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => openDelete(row.original.id)}
      title="Eliminar"
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Empleados"
        subtitle="Crear y gestionar empleados"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo empleado
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              ...columns,
              {
                id: "_actions",
                header: "",
                size: 96,
                cell: ({ row }) => (
                  <div className="flex gap-1 justify-end">
                    {rowActions(row)}
                  </div>
                ),
                enableSorting: false,
              },
            ]}
            data={rows}
            searchable={false}
            selectable={false}
            emptyMessage={"Sin datos"}
            className="[&_th]:py-2 [&_td]:py-2"
          />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Total: {rows.length}
          <Separator className="mx-3 h-4" orientation="vertical" />
          Página 1 de 1
        </CardFooter>
      </Card>

      {/* Dialog crear */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar empleado</DialogTitle>
            <DialogDescription>
              Complete los campos requeridos
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog eliminar */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirmOpen(false)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
