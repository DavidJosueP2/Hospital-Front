import React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Loader2 } from "lucide-react";
import {Combobox} from "@/components/ui/inputs/combobox";
import doctors from "@/services/doctors.service";
import specialties from "@/services/specialties.service";
import medicalCenters from "@/services/medicalCenters.service";

const genders = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Femenino" },
];

function validatePositiveNumber(v) {
    if (v === null || v === undefined || v === "") return "Requerido";
    const n = Number(v);
    if (!Number.isFinite(n)) return "Debe ser numérico";
    if (n <= 0) return "Debe ser positivo";
    return "";
}

export default function CreateDoctorDialog({ open, onOpenChange, onSuccess }) {
    const [mode, setMode] = React.useState("associate");
    const [pending, setPending] = React.useState(false);

    const [spOptions, setSpOptions] = React.useState([]);
    const [centerOptions, setCenterOptions] = React.useState([]);

    const [associateForm, setAssociateForm] = React.useState({ userId: "", specialtyId: "" });
    const [associateErrs, setAssociateErrs] = React.useState({ userId: "", specialtyId: "" });
    const [canAssociate, setCanAssociate] = React.useState(false);

    const [registerForm, setRegisterForm] = React.useState({
        username: "",
        password: "",
        gender: "",
        firstName: "",
        lastName: "",
        centerId: "",
        specialtyId: "",
    });
    const [registerErrs, setRegisterErrs] = React.useState({
        username: "",
        password: "",
        gender: "",
        firstName: "",
        lastName: "",
        centerId: "",
        specialtyId: "",
    });
    const [canRegister, setCanRegister] = React.useState(false);

    const loadOptions = React.useCallback(async () => {
        try {
            const [sp, centers] = await Promise.all([
                specialties.listAllSpecialties({ includeDeleted: false }),
                medicalCenters.listAllCenters({ includeDeleted: false }),
            ]);
            setSpOptions(sp.map((s) => ({ value: String(s.id), label: s.name })));
            setCenterOptions(centers.map((c) => ({ value: String(c.id), label: `${c.name} · ${c.city}` })));
        } catch {
            toast.error("Error cargando catálogos");
        }
    }, []);

    React.useEffect(() => {
        if (open) {
            setMode("associate");
            setAssociateForm({ userId: "", specialtyId: "" });
            setAssociateErrs({ userId: "", specialtyId: "" });
            setCanAssociate(false);
            setRegisterForm({ username: "", password: "", gender: "", firstName: "", lastName: "", centerId: "", specialtyId: "" });
            setRegisterErrs({ username: "", password: "", gender: "", firstName: "", lastName: "", centerId: "", specialtyId: "" });
            setCanRegister(false);
            loadOptions();
        }
    }, [open, loadOptions]);

    const validateAssociate = async (f) => {
        const errs = { userId: "", specialtyId: "" };
        errs.userId = validatePositiveNumber(f.userId);
        if (!f.specialtyId) errs.specialtyId = "Requerido";
        if (!errs.userId) {
            try {
                await doctors.getDoctorByUser(Number(f.userId));
                errs.userId = "El usuario ya está asociado a un doctor";
            } catch {}
        }
        setAssociateErrs(errs);
        setCanAssociate(!errs.userId && !errs.specialtyId);
    };

    const validateRegister = (f) => {
        const errs = { username: "", password: "", gender: "", firstName: "", lastName: "", centerId: "", specialtyId: "" };
        if (!f.username.trim()) errs.username = "Requerido";
        if (!f.password.trim()) errs.password = "Requerido";
        else if (f.password.length < 8) errs.password = "Mínimo 8 caracteres";
        if (!f.gender) errs.gender = "Requerido";
        if (!f.firstName.trim()) errs.firstName = "Requerido";
        if (!f.lastName.trim()) errs.lastName = "Requerido";
        errs.centerId = validatePositiveNumber(f.centerId);
        if (!f.specialtyId) errs.specialtyId = "Requerido";
        setRegisterErrs(errs);
        setCanRegister(Object.values(errs).every((x) => !x));
    };

    React.useEffect(() => {
        if (!open) return;
        if (mode === "associate") validateAssociate(associateForm);
    }, [associateForm, mode, open]);

    React.useEffect(() => {
        if (!open) return;
        if (mode === "register") validateRegister(registerForm);
    }, [registerForm, mode, open]);

    const submit = async () => {
        setPending(true);
        try {
            if (mode === "associate") {
                const payload = { userId: Number(associateForm.userId), specialtyId: Number(associateForm.specialtyId) };
                const res = await doctors.createDoctor(payload);
                toast.success("Doctor asociado", { description: `Usuario ${res?.data?.userId}` });
            } else {
                const payload = {
                    username: registerForm.username.trim(),
                    password: registerForm.password,
                    gender: registerForm.gender,
                    firstName: registerForm.firstName.trim(),
                    lastName: registerForm.lastName.trim(),
                    centerId: Number(registerForm.centerId),
                    specialtyId: Number(registerForm.specialtyId),
                };
                const res = await doctors.registerDoctor(payload);
                toast.success("Doctor registrado", { description: `ID ${res?.data?.id}` });
            }
            onOpenChange(false);
            if (typeof onSuccess === "function") onSuccess();
        } catch (e) {
            const f = doctors.parseFieldErrors(e);
            if (mode === "associate") setAssociateErrs((prev) => ({ ...prev, ...f }));
            else setRegisterErrs((prev) => ({ ...prev, ...f }));
            toast.error(e?.message || "Error");
        } finally {
            setPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!pending) onOpenChange(o); }}>
            {/* ancho ampliado */}
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Crear doctor</DialogTitle>
                    <DialogDescription>Selecciona el modo y completa los campos</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Modo</Label>
                        <div className="flex gap-2">
                            <Button type="button" variant={mode === "associate" ? "default" : "outline"} size="sm" onClick={() => setMode("associate")} disabled={pending}>
                                Asociar empleado
                            </Button>
                            <Button type="button" variant={mode === "register" ? "default" : "outline"} size="sm" onClick={() => setMode("register")} disabled={pending}>
                                Registrar nuevo
                            </Button>
                        </div>
                    </div>

                    {mode === "associate" ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="userId">ID de usuario</Label>
                                <Input
                                    id="userId"
                                    inputMode="numeric"
                                    value={associateForm.userId}
                                    onChange={(e) => setAssociateForm((f) => ({ ...f, userId: e.target.value }))}
                                    onBlur={() => validateAssociate(associateForm)}
                                    aria-invalid={!!associateErrs.userId}
                                    placeholder="Ej. 2"
                                />
                                {associateErrs.userId ? <p className="text-xs text-destructive">{associateErrs.userId}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label>Especialidad</Label>
                                <Combobox
                                    options={spOptions}
                                    value={associateForm.specialtyId}
                                    onChange={(v) => setAssociateForm((f) => ({ ...f, specialtyId: v }))}
                                    onBlur={() => validateAssociate(associateForm)}
                                    placeholder="Selecciona especialidad"
                                />
                                {associateErrs.specialtyId ? <p className="text-xs text-destructive">{associateErrs.specialtyId}</p> : null}
                            </div>
                        </div>
                    ) : (
                        /* dos columnas en registro */
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Usuario</Label>
                                <Input
                                    id="username"
                                    value={registerForm.username}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    aria-invalid={!!registerErrs.username}
                                    placeholder="usuario@empresa.com o username"
                                />
                                {registerErrs.username ? <p className="text-xs text-destructive">{registerErrs.username}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    aria-invalid={!!registerErrs.password}
                                />
                                {registerErrs.password ? <p className="text-xs text-destructive">{registerErrs.password}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label>Género</Label>
                                <Combobox
                                    options={genders}
                                    value={registerForm.gender}
                                    onChange={(v) => setRegisterForm((f) => ({ ...f, gender: v }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    placeholder="Selecciona género"
                                />
                                {registerErrs.gender ? <p className="text-xs text-destructive">{registerErrs.gender}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="firstName">Nombres</Label>
                                <Input
                                    id="firstName"
                                    value={registerForm.firstName}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    aria-invalid={!!registerErrs.firstName}
                                />
                                {registerErrs.firstName ? <p className="text-xs text-destructive">{registerErrs.firstName}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Apellidos</Label>
                                <Input
                                    id="lastName"
                                    value={registerForm.lastName}
                                    onChange={(e) => setRegisterForm((f) => ({ ...f, lastName: e.target.value }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    aria-invalid={!!registerErrs.lastName}
                                />
                                {registerErrs.lastName ? <p className="text-xs text-destructive">{registerErrs.lastName}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label>Centro médico</Label>
                                <Combobox
                                    options={centerOptions}
                                    value={registerForm.centerId}
                                    onChange={(v) => setRegisterForm((f) => ({ ...f, centerId: v }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    placeholder="Selecciona centro"
                                />
                                {registerErrs.centerId ? <p className="text-xs text-destructive">{registerErrs.centerId}</p> : null}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label>Especialidad</Label>
                                <Combobox
                                    options={spOptions}
                                    value={registerForm.specialtyId}
                                    onChange={(v) => setRegisterForm((f) => ({ ...f, specialtyId: v }))}
                                    onBlur={() => validateRegister(registerForm)}
                                    placeholder="Selecciona especialidad"
                                />
                                {registerErrs.specialtyId ? <p className="text-xs text-destructive">{registerErrs.specialtyId}</p> : null}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
                    <Button onClick={submit} disabled={pending || (mode === "associate" ? !canAssociate : !canRegister)}>
                        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Crear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
