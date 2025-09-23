// src/components/utils/ProtectedRoute.jsx
import React, { useContext, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export function ProtectedRoute({ roles, allowedRoles }) {
  const { isLoading, isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 text-gray-600">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
        <p className="text-sm">Espere un momento...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const required = useMemo(() => {
    const list = allowedRoles ?? roles;
    if (!list) return null;
    return Array.isArray(list) ? list : [list];
  }, [allowedRoles, roles]);

  if (required) {
    const userRoles = (user?.roles ?? []).map((r) => r?.name).filter(Boolean);
    const hasAccess = userRoles.some((r) => required.includes(r));
    if (!hasAccess) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 text-gray-600">
          <ShieldAlert className="h-10 w-10 text-red-500" />
          <p className="text-sm">
            No tienes permisos para acceder a esta página
          </p>
        </div>
      );
    }
  }

  return <Outlet />;
}
