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
import DataTable from "@/components/ui/table/data-table-pb";
import { PageHeading } from "@/components/ui/typography/Heading";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import SpecialtyForm from "@/components/specialty/SpecialtyForm";
import specialties from "@/services/specialties.service";

// Columnas con ordenamiento por columna habilitado (no añadimos enableSorting:false)
const baseColumns = (onEdit, onDelete) => [
    {
        accessorKey: "id",
        header: "ID",
        size: 72,
        cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span>,
    },
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => (
            <span className="text-muted-foreground line-clamp-2 max-w-[520px]">
        {row.original.description || "—"}
      </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Creado",
        size: 160,
        cell: ({ row }) =>
            row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "—",
    },
    {
        accessorKey: "updatedAt",
        header: "Actualizado",
        size: 160,
        cell: ({ row }) =>
            row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString() : "—",
    },
    {
        id: "actions",
        header: "Acciones",
        size: 96,
        cell: ({ row }) => {
            const d = row.original;
            return (
                <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" title="Editar" onClick={() => onEdit(d)}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        title="Eliminar"
                        onClick={() => onDelete(d)}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            );
        },
    },
];

export default function SpecialtiesPage() {
    // Estado de paginación del servidor
    const [includeDeleted, setIncludeDeleted] = React.useState(false);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);

    // Datos
    const [rows, setRows] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [pageCount, setPageCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Crear
    const [createOpen, setCreateOpen] = React.useState(false);
    const [createForm, setCreateForm] = React.useState({ name: "", description: "" });
    const [createErrors, setCreateErrors] = React.useState({});
    const [canCreate, setCanCreate] = React.useState(false);
    const [createPending, setCreatePending] = React.useState(false);

    // Editar
    const [editOpen, setEditOpen] = React.useState(false);
    const [editId, setEditId] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ name: "", description: "" });
    const [editErrors, setEditErrors] = React.useState({});
    const [canEdit, setCanEdit] = React.useState(false);
    const [editPending, setEditPending] = React.useState(false);

    // Eliminar
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [confirmId, setConfirmId] = React.useState(null);
    const [deletePending, setDeletePending] = React.useState(false);

    const load = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await specialties.listSpecialties({
                includeDeleted,
                page: pageIndex,
                size: pageSize,
                // Si tu API acepta sort, puedes añadirlo aquí
                // sort: "name,asc"
            });
            setRows(data?.content ?? []);
            setTotal(data?.totalElements ?? 0);
            setPageCount(data?.totalPages ?? 0);
        } catch (e) {
            const msg = e?.response?.data?.detail || e?.message || "Error";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [includeDeleted, pageIndex, pageSize]);

    React.useEffect(() => {
        load();
    }, [load]);

    const onPaginationChange = ({ pageIndex: pi, pageSize: ps }) => {
        if (pi !== pageIndex || ps !== pageSize) {
            setPageIndex(pi);
            setPageSize(ps);
        }
    };

    // Handlers
    const openCreate = () => {
        if (editPending || deletePending) return;
        setCreateForm({ name: "", description: "" });
        setCreateErrors({});
        setCanCreate(false);
        setCreateOpen(true);
    };

    const submitCreate = async () => {
        setCreateErrors({});
        setCreatePending(true);
        try {
            const res = await specialties.createSpecialty(createForm);
            toast.success("Especialidad creada", { description: res?.data?.name });
            setCreateOpen(false);
            setPageIndex(0);
            await load();
        } catch (e) {
            const fieldErrs = specialties.parseFieldErrors?.(e) ?? {};
            if (Object.keys(fieldErrs).length) setCreateErrors(fieldErrs);
            toast.error(e?.message || "Error");
        } finally {
            setCreatePending(false);
        }
    };

    const onEdit = async (item) => {
        if (createPending || deletePending) return;
        setEditErrors({});
        try {
            const { data } = await specialties.getSpecialty(item.id, { includeDeleted });
            setEditId(data.id);
            setEditForm({ name: data.name, description: data.description || "" });
            setCanEdit(true);
            setEditOpen(true);
        } catch (e) {
            toast.error(e?.message || "Error");
        }
    };

    const submitEdit = async () => {
        setEditErrors({});
        setEditPending(true);
        try {
            const res = await specialties.updateSpecialty(editId, editForm);
            toast.success("Especialidad actualizada", { description: res?.data?.name });
            setEditOpen(false);
            await load();
        } catch (e) {
            if (e?.status === 409 || e?.response?.status === 409) {
                toast.error(
                    "Esta especialidad fue modificada por otro usuario. Refresca los datos e inténtalo de nuevo."
                );
            } else {
                const fieldErrs = specialties.parseFieldErrors?.(e) ?? {};
                if (Object.keys(fieldErrs).length) setEditErrors(fieldErrs);
                toast.error(e?.message || "Error");
            }
        } finally {
            setEditPending(false);
        }
    };

    const onDelete = (item) => {
        if (createPending || editPending) return;
        setConfirmId(item.id);
        setConfirmOpen(true);
    };

    const submitDelete = async () => {
        setDeletePending(true);
        try {
            await specialties.deleteSpecialty(confirmId);
            setConfirmOpen(false);
            toast.success("Especialidad eliminada", { description: `ID ${confirmId}` });
            // Si queda vacía la página actual, retrocede una
            if (rows.length === 1 && pageIndex > 0) {
                setPageIndex((p) => p - 1);
            } else {
                await load();
            }
        } catch (e) {
            toast.error(e?.message || "Error");
        } finally {
            setDeletePending(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Especialidades"
                subtitle="Crea, actualiza y administra las especialidades"
                actions={
                    <div className="flex gap-2">
                        <Button
                            onClick={openCreate}
                            disabled={createPending || editPending || deletePending}
                        >
                            <Plus className="mr-2 size-4" />
                            Nueva especialidad
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIncludeDeleted((v) => !v);
                                setPageIndex(0);
                            }}
                            disabled={createPending || editPending || deletePending}
                        >
                            {includeDeleted ? "Ocultar eliminadas" : "Mostrar eliminadas"}
                        </Button>
                    </div>
                }
            />

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle>Especialidades</CardTitle>
                </CardHeader>

                <CardContent>
                    <DataTable
                        columns={baseColumns(onEdit, onDelete)}
                        data={rows}
                        manualPagination={true}
                        pageCount={Math.max(pageCount, 1)}
                        totalRows={total}
                        state={{ pagination: { pageIndex, pageSize } }}
                        onPaginationChange={onPaginationChange}
                        emptyMessage={isLoading ? "Cargando..." : error ? error : "Sin datos"}
                        searchable={false} // sin filtros ni buscador
                        className="[&_th]:py-2 [&_td]:py-2"
                    />
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground">
                    Total: {total}
                    <Separator className="mx-3 h-4" orientation="vertical" />
                    Página {pageIndex + 1} de {Math.max(pageCount, 1)}
                    <Separator className="mx-3 h-4" orientation="vertical" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={load}
                        disabled={isLoading || createPending || editPending || deletePending}
                    >
                        {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Refrescar
                    </Button>
                </CardFooter>
            </Card>

            {/* Crear */}
            <Dialog open={createOpen} onOpenChange={(o) => !createPending && setCreateOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear especialidad</DialogTitle>
                        <DialogDescription>Completa los campos requeridos</DialogDescription>
                    </DialogHeader>
                    <SpecialtyForm
                        value={createForm}
                        onChange={setCreateForm}
                        errors={createErrors}
                        onValidityChange={setCanCreate}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={createPending}>
                            Cancelar
                        </Button>
                        <Button onClick={submitCreate} disabled={!canCreate || createPending}>
                            {createPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Crear
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Editar */}
            <Dialog open={editOpen} onOpenChange={(o) => !editPending && setEditOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar especialidad</DialogTitle>
                        <DialogDescription>Actualiza los campos y guarda</DialogDescription>
                    </DialogHeader>
                    <SpecialtyForm
                        value={editForm}
                        onChange={setEditForm}
                        errors={editErrors}
                        onValidityChange={setCanEdit}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={editPending}>
                            Cancelar
                        </Button>
                        <Button onClick={submitEdit} disabled={!canEdit || editPending}>
                            {editPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Eliminar */}
            <AlertDialog open={confirmOpen} onOpenChange={(o) => !deletePending && setConfirmOpen(o)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar especialidad?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletePending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={submitDelete} disabled={deletePending}>
                            {deletePending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
