import React from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/shadcn/alert-dialog";
import DataTable from "@/components/ui/table/data-table";
import { PageHeading } from "@/components/ui/typography/Heading";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import doctors from "@/services/doctors.service";
import CreateDoctorDialog from "@/components/doctor/CreateDoctorDialog";
import EditDoctorDialog from "@/components/doctor/EditDoctorDialog";

const columns = [
    { accessorKey: "id", header: "ID", size: 72, cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span> },

    {
        id: "user",
        header: "Usuario",
        cell: ({ row }) => {
            const d = row.original;
            const title = d.gender === "FEMALE" ? "Dra." : "Dr.";
            const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ") || d.username;
            return (
                <div className="leading-snug">
                    <div className="font-medium">{title} {fullName}</div>
                    <div className="text-xs text-muted-foreground">C.I. {d.username}</div>
                </div>
            );
        },
    },

    { accessorKey: "specialtyName", header: "Especialidad", cell: ({ row }) => row.original.specialtyName || "—" },
    { accessorKey: "createdAt", header: "Creado", size: 140, cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    { accessorKey: "updatedAt", header: "Actualizado", size: 140, cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString() },
];


export default function DoctorsPage() {
    const [includeDeleted, setIncludeDeleted] = React.useState(false);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [sort, setSort] = React.useState("id,asc");

    const [rows, setRows] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [pageCount, setPageCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editId, setEditId] = React.useState(null);

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [confirmId, setConfirmId] = React.useState(null);
    const [deletePending, setDeletePending] = React.useState(false);

    const load = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await doctors.listDoctors({ includeDeleted, page: pageIndex, size: pageSize, sort });
            setRows(data.content ?? []);
            setTotal(data.totalElements ?? 0);
            setPageCount(data.totalPages ?? 0);
        } catch (e) {
            setError(e?.message || "Error");
            toast.error(e?.message || "Error");
        } finally {
            setIsLoading(false);
        }
    }, [includeDeleted, pageIndex, pageSize, sort]);

    React.useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => setCreateOpen(true);

    const openEdit = (item) => {
        setEditId(item.id);
        setEditOpen(true);
    };

    const openDelete = (item) => {
        setConfirmId(item.id);
        setConfirmOpen(true);
    };

    const submitDelete = async () => {
        setDeletePending(true);
        try {
            await doctors.deleteDoctor(confirmId);
            setConfirmOpen(false);
            toast.success("Doctor eliminado", { description: `ID ${confirmId}` });
            await load();
        } catch (e) {
            toast.error(e?.message || "Error");
        } finally {
            setDeletePending(false);
        }
    };

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

    return (
        <div className="space-y-6">
            <PageHeading
                title="Doctores"
                subtitle="Crea, asocia, edita y administra doctores"
                actions={
                    <div className="flex gap-2">
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Nuevo doctor
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => { setIncludeDeleted((v) => !v); setPageIndex(0); }}
                        >
                            {includeDeleted ? "Ocultar eliminados" : "Mostrar eliminados"}
                        </Button>
                    </div>
                }
            />

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle>Doctores</CardTitle>
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
                        emptyMessage={isLoading ? "Cargando..." : error ? error : "Sin datos"}
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
                        {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Refrescar
                    </Button>
                </CardFooter>
            </Card>

            <CreateDoctorDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={load}
            />

            <EditDoctorDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                doctorId={editId}
                includeDeleted={includeDeleted}
                onSuccess={load}
            />

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar doctor?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
