import React from "react";
import DataTable from "../ui/table/data-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/shadcn/button";


export default function PatientTable({ data, columns, onView, onEdit, onDelete, selectedRows, setSelectedRows }) {
    const rowActions = (row) => {
        const patient = row.original;
        return (
            <>
                <Button size="icon" variant="ghost" onClick={() => onView(patient)} title="Ver">
                    <Eye className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(patient)} title="Editar">
                    <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(patient)} title="Eliminar">
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            selectable
            searchable
            rowActions={rowActions}
            onSelectionChange={setSelectedRows}
            emptyMessage="No hay pacientes"
        />
    );
}
