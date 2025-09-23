import React from "react";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";

const maxLen = { name: 100, city: 100, address: 200 };

const validateField = (field, v) => {
    const val = (v ?? "").trim();
    if (!val) {
        if (field === "name") return "El nombre es obligatorio";
        if (field === "city") return "La ciudad es obligatoria";
        if (field === "address") return "La dirección es obligatoria";
    }
    if (field === "name" && val.length > maxLen.name) return "Máximo 100 caracteres";
    if (field === "city" && val.length > maxLen.city) return "Máximo 100 caracteres";
    if (field === "address" && val.length > maxLen.address) return "Máximo 200 caracteres";
    return "";
};

export default function CenterForm({ value, onChange, errors = {}, onValidityChange }) {
    const [localErrors, setLocalErrors] = React.useState({ name: "", city: "", address: "" });
    const [touched, setTouched] = React.useState({ name: false, city: false, address: false });

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
        city: errors.city || localErrors.city,
        address: errors.address || localErrors.address,
    };

    const isValid =
        !mergedErrors.name &&
        !mergedErrors.city &&
        !mergedErrors.address &&
        (value.name ?? "").trim() &&
        (value.city ?? "").trim() &&
        (value.address ?? "").trim();

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
                <Label htmlFor="city">Ciudad</Label>
                <Input
                    id="city"
                    value={value.city}
                    onChange={(e) => setField("city", e.target.value)}
                    onBlur={() => onBlur("city")}
                    aria-invalid={!!mergedErrors.city}
                />
                {(touched.city || errors.city) && mergedErrors.city ? (
                    <p className="text-xs text-destructive">{mergedErrors.city}</p>
                ) : null}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                    id="address"
                    value={value.address}
                    onChange={(e) => setField("address", e.target.value)}
                    onBlur={() => onBlur("address")}
                    aria-invalid={!!mergedErrors.address}
                />
                {(touched.address || errors.address) && mergedErrors.address ? (
                    <p className="text-xs text-destructive">{mergedErrors.address}</p>
                ) : null}
            </div>
        </div>
    );
}
