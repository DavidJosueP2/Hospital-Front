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

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rutas dentro del layout de administración */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/playground" replace />} />
              <Route path="/playground" element={<Playground />} />
            </Route>
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
