import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Playground from "@/pages/admin/Playground";
import AppToaster from "@/inc/ui/Toaster.jsx";
import NotFound from "@/pages/NotFound.jsx";
import AuthLayout from "@/pages/auth/AuthLayour";
import Login from "@/pages/auth/Login";
import ErrorBoundary from "@/utils/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import PasswordRecovery from "@/pages/auth/PasswordRecovery";
import ResetPassword from "@/pages/auth/ResetPassword";
import MedicalCentersPage from "@/pages/admin/MedicalCentersPage.jsx";
import PatientsPage from "./pages/patients/PatientsPage";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/reset" element={<ResetPassword />} />
          </Route>

          {/* Rutas dentro del layout de administración */}
          <Route element={<ProtectedRoute />}>

          </Route>

            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/playground" replace />} />
                <Route path="/playground" element={<Playground />} />
                 <Route path="/admin/patients" element={<PatientsPage />} />
                <Route path="/center" element={<MedicalCentersPage />} />
            </Route>

          {/* Fallback público */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toaster global (fuera de <Routes>) */}
        <AppToaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
