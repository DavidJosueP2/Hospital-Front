import { KeyRound } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import passwordService from "@/services/passwordService";
import AlertMessage from "@/components/ui/alerts/AlertMessage";

function PasswordRecovery() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await passwordService.requestReset(input);
      setMessage(
        "Si la cuenta existe, hemos enviado un correo con instrucciones."
      );
    } catch (err) {
      setMessage("Ocurrió un error al procesar la solicitud.");
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
            Recuperar contraseña
          </CardTitle>
          <CardDescription className="text-gray-500">
            Ingresa tu correo electrónico o DNI para restablecer tu contraseña
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="input">Email o DNI</Label>
              <Input
                id="input"
                type="text"
                placeholder="ejemplo@mail.com o 12345678"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>

          {/* Mensaje de respuesta */}
          {message && (
            <AlertMessage
              type={message.includes("éxito") ? "success" : "error"}
            >
              {message}
            </AlertMessage>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col items-center text-sm text-gray-500">
          <p className="mb-1">¿Ya recordaste tu contraseña?</p>
          <Button
            asChild
            variant="link"
            className="text-sky-600 hover:underline p-0 font-medium"
          >
            <Link to="/login">Inicia sesión aquí</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PasswordRecovery;
