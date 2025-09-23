// src/components/utils/ProtectedRoute.jsx
import React, { useContext, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export function ProtectedRoute({ roles, allowedRoles }) {

}
