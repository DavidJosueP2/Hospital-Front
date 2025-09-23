import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Button } from "@/components/ui/shadcn/button";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";

function LoginFormComponent() {
  const [identifier, setIdentifier] = useState(""); // DNI o Email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // 🔍 Validación de DNI o Email
  const isValidDni = (value) => /^\d{10}$/.test(value);
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = "El DNI o email es requerido";
    } else if (!isValidDni(identifier) && !isValidEmail(identifier)) {
      newErrors.identifier =
        "Ingresa un DNI válido (10 dígitos) o un email válido";
    }

    if (!password) newErrors.password = "La contraseña es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await login(identifier, password);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setErrors({ general: "Credenciales inválidas" });
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Error al iniciar sesión" });
    }
  };

  return (
    <div className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DNI o Email */}
        <div className="grid gap-2">
          <Label htmlFor="identifier">DNI o Email</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ingresa tu DNI (10 dígitos) o tu email"
            aria-invalid={!!errors.identifier}
          />
          {errors.identifier && (
            <p className="text-xs text-red-500">{errors.identifier}</p>
          )}
        </div>

        {/* Contraseña */}
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Botón */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </div>
  );
}

export default LoginFormComponent;
