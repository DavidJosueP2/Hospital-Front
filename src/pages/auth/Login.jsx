import { Heart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import LoginFormComponent from "@/pages/auth/LoginFormComponente";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-sky-50 via-white to-white">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-14 rounded-full flex items-center justify-center bg-sky-600 shadow-md">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-sky-600">
              Gestión Hospitalaria
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Bienvenido de vuelta
          </CardTitle>
          <CardDescription className="text-gray-500">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent className="mt-4">
          <LoginFormComponent />
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col items-center text-sm text-gray-500">
          <p className="mb-1">¿Olvidaste tu contraseña?</p>
          <Button
            variant="link"
            className="text-sky-600 hover:underline p-0 font-medium"
          >
            Recupérala aquí
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
