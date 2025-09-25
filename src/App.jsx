import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Playground from "@/pages/admin/Playground";
import AppToaster from "@/inc/ui/Toaster.jsx";
import NotFound from "@/pages/NotFound.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import Login from "@/pages/auth/Login";
import ErrorBoundary from "@/utils/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import PasswordRecovery from "@/pages/auth/PasswordRecovery";
import ResetPassword from "@/pages/auth/ResetPassword";
import MedicalCentersPage from "@/pages/admin/MedicalCentersPage.jsx";
import SpecialtiesPage from "@/pages/admin/SpecialtiesPage.jsx";
import DoctorsPage from "@/pages/admin/DoctorPage.jsx";
import PatientsPage from "./pages/patients/PatientsPage";
import EmployeesPage from "@/pages/employees/EmployeePage";
import Forbidden from "@/pages/Forbidden.jsx"; // <-- tu página 403
import { useAuth } from "@/hooks/use-auth";

function RoleBasedHome() {
    const { user } = useAuth();
    const roles = Array.isArray(user?.roles) ? user.roles.map(r => String(r).toUpperCase()) : [];
    if (roles.includes("ADMIN")) return <Navigate to="/playground" replace />;
    if (roles.includes("DOCTOR")) return <Navigate to="/patients" replace />;
    return <Navigate to="/forbidden" replace />;
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Routes>
                    {/* Auth (público) */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/password-recovery" element={<PasswordRecovery />} />
                        <Route path="/reset" element={<ResetPassword />} />
                    </Route>

                    {/* Bloque protegido: requiere login */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                            {/* Index home según rol */}
                            <Route index element={<RoleBasedHome />} />

                            {/* --- ADMIN ONLY --- */}
                            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                                <Route path="/playground" element={<Playground />} />
                                <Route path="/employees" element={<EmployeesPage />} />
                                <Route path="/centers" element={<MedicalCentersPage />} />
                                <Route path="/specialties" element={<SpecialtiesPage />} />
                                <Route path="/doctors" element={<DoctorsPage />} />
                            </Route>

                            {/* --- DOCTOR, ADMIN ONLY --- */}
                            <Route element={<ProtectedRoute allowedRoles={["DOCTOR","ADMIN"]} />}>
                                <Route path="/patients" element={<PatientsPage />} />
                                {/* /consultations cuando lo implementes */}
                                {/* <Route path="/consultations" element={<ConsultationsPage />} /> */}
                            </Route>
                        </Route>
                    </Route>

                    {/* 403 y 404 (públicos) */}
                    <Route path="/forbidden" element={<Forbidden />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>

                <AppToaster />
            </AuthProvider>
        </ErrorBoundary>
    );
}
