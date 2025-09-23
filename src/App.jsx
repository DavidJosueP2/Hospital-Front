import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Playground from "@/pages/admin/Playground";
import AppToaster from "@/inc/ui/Toaster.jsx";
import NotFound from "@/pages/NotFound.jsx";

export default function App() {
    return (
        <>
            <Routes>
                {/* Rutas dentro del layout de administración */}
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/playground" replace />} />
                    <Route path="/playground" element={<Playground />} />
                </Route>

                {/* Fallback público */}
                <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toaster global (fuera de <Routes>) */}
            <AppToaster />
        </>
    );
}
