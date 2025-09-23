import React from "react";
import { toast } from "sonner";
import { useCentersPage, useCreateCenter, useUpdateCenter, useDeleteCenter } from "@/hooks/useMedicalCenters";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/shadcn/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/shadcn/alert-dialog";
import DataTable from "@/components/ui/table/data-table";
import { PageHeading } from "@/components/ui/typography/Heading";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CenterForm from "@/components/medicalCenter/CenterForm";
import medicalCenters from "@/services/medicalCenters.service";

const columns = [
    { accessorKey: "id", header: "ID", size: 72, cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span> },
    { accessorKey: "name", header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "city", header: "Ciudad", cell: ({ row }) => row.original.city },
    { accessorKey: "address", header: "Dirección", cell: ({ row }) => <span className="text-muted-foreground">{row.original.address}</span> },
    { accessorKey: "updatedAt", header: "Actualizado", size: 120, cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString() },
];

export default function MedicalCentersPage() {
    const [includeDeleted, setIncludeDeleted] = React.useState(false);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [sort, setSort] = React.useState("name,asc");

    const { data, isLoading, isError, error, refetch } = useCentersPage({ includeDeleted, page: pageIndex, size: pageSize, sort });
    const rows = data?.content ?? [];
    const total = data?.totalElements ?? 0;
    const pageCount = data?.totalPages ?? 0;

    const [createOpen, setCreateOpen] = React.useState(false);
    const [createForm, setCreateForm] = React.useState({ name: "", city: "", address: "" });
    const [createErrors, setCreateErrors] = React.useState({});
    const createMut = useCreateCenter();

    const [editOpen, setEditOpen] = React.useState(false);
    const [editId, setEditId] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ name: "", city: "", address: "" });
    const [editErrors, setEditErrors] = React.useState({});
    const updateMut = useUpdateCenter(editId);

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [confirmId, setConfirmId] = React.useState(null);
    const deleteMut = useDeleteCenter(confirmId);

    const [canCreate, setCanCreate] = React.useState(false);
    const [canEdit, setCanEdit] = React.useState(false);

    const rowActions = (row) => {
        const item = row.original;
        return (
            <>
                <Button size="icon" variant="ghost" onClick={() => openEdit(item)} title="Editar">
                    <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openDelete(item)} title="Eliminar">
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </>
        );
    };

    const openCreate = () => {
        setCreateForm({ name: "", city: "", address: "" });
        setCreateErrors({});
        setCreateOpen(true);
    };

    const openEdit = (item) => {
        setEditId(item.id);
        setEditForm({ name: item.name, city: item.city, address: item.address });
        setEditErrors({});
        setEditOpen(true);
    };

    const openDelete = (item) => {
        setConfirmId(item.id);
        setConfirmOpen(true);
    };

    const submitCreate = async () => {
        setCreateErrors({});
        try {
            const res = await createMut.mutateAsync(createForm);
            toast.success("Centro creado", { description: res?.data?.name });
            setCreateOpen(false);
        } catch (e) {
            const fieldErrs = medicalCenters.parseFieldErrors(e);
            if (Object.keys(fieldErrs).length) setCreateErrors(fieldErrs);
            toast.error(e?.message || "Error");
        }
    };

    const submitEdit = async () => {
        setEditErrors({});
        try {
            const etag = medicalCenters.getStoredEtag(editId);
            const res = await updateMut.mutateAsync({ ...editForm, ...(etag ? { _etag: etag } : {}) });
            toast.success("Centro actualizado", { description: res?.data?.name });
            setEditOpen(false);
        } catch (e) {
            const fieldErrs = medicalCenters.parseFieldErrors(e);
            if (Object.keys(fieldErrs).length) setEditErrors(fieldErrs);
            toast.error(e?.message || "Error");
        }
    };

    const submitDelete = async () => {
        try {
            await deleteMut.mutateAsync();
            setConfirmOpen(false);
            toast.success("Centro eliminado", { description: `ID ${confirmId}` });
        } catch (e) {
            toast.error(e?.message || "Error");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Centros Médicos"
                subtitle="Crear, actualizar y gestionar centros"
                actions={
                    <div className="flex gap-2">
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Nuevo centro
                        </Button>
                        <Button variant="outline" onClick={() => setIncludeDeleted((v) => !v)}>
                            {includeDeleted ? "Ocultar eliminados" : "Mostrar eliminados"}
                        </Button>
                    </div>
                }
            />

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle>Centros</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={[
                            ...columns,
                            {
                                id: "_actions",
                                header: "",
                                size: 96,
                                cell: ({ row }) => <div className="flex gap-1 justify-end">{rowActions(row)}</div>,
                                enableSorting: false,
                            },
                        ]}
                        data={rows}
                        initialPageSize={pageSize}
                        searchable={false}
                        selectable={false}
                        emptyMessage={isLoading ? "Cargando..." : isError ? (error?.message || "Error") : "Sin datos"}
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
                            onSortChange: setSort,
                        }}
                    />
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                    Total: {total}
                    <Separator className="mx-3 h-4" orientation="vertical" />
                    Página {pageIndex + 1} de {Math.max(pageCount, 1)}
                    <Separator className="mx-3 h-4" orientation="vertical" />
                    <Button variant="ghost" size="sm" onClick={() => refetch()}>Actualizar</Button>
                </CardFooter>
            </Card>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear centro</DialogTitle>
                        <DialogDescription>Complete los campos requeridos</DialogDescription>
                    </DialogHeader>
                    <CenterForm
                        value={createForm}
                        onChange={setCreateForm}
                        errors={createErrors}
                        onValidityChange={setCanCreate}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={submitCreate} disabled={!canCreate}>Crear</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar centro</DialogTitle>
                        <DialogDescription>Actualice los campos y guarde</DialogDescription>
                    </DialogHeader>
                    <CenterForm
                        value={editForm}
                        onChange={setEditForm}
                        errors={editErrors}
                        onValidityChange={setCanEdit}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancelar</Button>
                        <Button onClick={submitEdit} disabled={!canEdit}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar centro?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={submitDelete} disabled={deleteMut.isPending}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
