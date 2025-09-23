import React from "react";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";

const maxLen = { name: 100, description: 1000 };

const validateField = (field, v) => {
    const val = (v ?? "").trim();
    if (field === "name") {
        if (!val) return "El nombre es obligatorio";
        if (val.length > maxLen.name) return "Máximo 100 caracteres";
    }
    if (field === "description") {
        if (val.length > maxLen.description) return "Máximo 1000 caracteres";
    }
    return "";
};

export default function SpecialtyForm({ value, onChange, errors = {}, onValidityChange }) {
    const [localErrors, setLocalErrors] = React.useState({ name: "", description: "" });
    const [touched, setTouched] = React.useState({ name: false, description: false });

    const setField = (field, val) => {
        const next = { ...value, [field]: val };
        onChange(next);
        const msg = validateField(field, val);
        setLocalErrors((e) => ({ ...e, [field]: msg }));
    };

    const onBlur = (field) => {
        setTouched((t) => ({ ...t, [field]: true }));
        const msg = validateField(field, value[field]);
        setLocalErrors((e) => ({ ...e, [field]: msg }));
    };

    const mergedErrors = {
        name: errors.name || localErrors.name,
        description: errors.description || localErrors.description,
    };

    const isValid =
        !mergedErrors.name &&
        !mergedErrors.description &&
        (value.name ?? "").trim() !== "" &&
        (value.description ?? "").length <= maxLen.description;

    React.useEffect(() => {
        if (typeof onValidityChange === "function") onValidityChange(!!isValid);
    }, [isValid, onValidityChange]);

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                    id="name"
                    value={value.name}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => onBlur("name")}
                    aria-invalid={!!mergedErrors.name}
                />
                {(touched.name || errors.name) && mergedErrors.name ? (
                    <p className="text-xs text-destructive">{mergedErrors.name}</p>
                ) : null}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={value.description}
                    onChange={(e) => setField("description", e.target.value)}
                    onBlur={() => onBlur("description")}
                    aria-invalid={!!mergedErrors.description}
                    rows={4}
                    placeholder="Opcional"
                />
                {(touched.description || errors.description) && mergedErrors.description ? (
                    <p className="text-xs text-destructive">{mergedErrors.description}</p>
                ) : null}
                <div className="text-[11px] text-muted-foreground text-right">
                    {(value.description ?? "").length}/{maxLen.description}
                </div>
            </div>
        </div>
    );
}
