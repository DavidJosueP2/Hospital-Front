import { KeyRound } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import passwordService from "@/services/passwordService";
import AlertMessage from "@/components/ui/alerts/AlertMessage";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await passwordService.reset(token, newPassword);
      setMessage("Tu contraseña fue actualizada con éxito.");
    } catch (err) {
      console.error(err);
      setMessage("No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-sky-50 via-white to-white">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-14 rounded-full flex items-center justify-center bg-sky-600 shadow-md">
              <KeyRound className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-sky-600">
              Gestión Hospitalaria
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Restablecer contraseña
          </CardTitle>
          <CardDescription className="text-gray-500">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            >
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </form>

          {message && (
            <AlertMessage
              type={message.includes("éxito") ? "success" : "error"}
            >
              {message}
            </AlertMessage>
          )}

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sky-600 hover:underline text-sm font-medium"
            >
              Volver al login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;
