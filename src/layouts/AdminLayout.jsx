import React from "react";
import { Outlet } from "react-router-dom";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import AdminSidebar from "@/inc/admin/AdminSidebar";
import AdminBreadcrumbs from "@/inc/admin/AdminBreadcrumbs";
import ThemeToggle from "@/inc/theme/ThemeToggle.jsx";

export default function AdminLayout() {
    return (
        <SidebarProvider>
            <AdminSidebar />

            {/* Lado derecho del layout: SIN padding, full width siempre */}
            <SidebarInset className="flex min-h-svh w-full max-w-none flex-col bg-background p-0 !p-0">
                {/* Header full-bleed que no depende del contenido */}
                <header className="sticky top-0 z-30 w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                    <div className="flex h-14 w-full items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <SidebarTrigger
                                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent/50"
                                aria-label="Toggle sidebar"
                                title="Abrir/Cerrar menú"
                            />
                            <div className="min-w-0 flex-1">
                                <AdminBreadcrumbs />
                            </div>
                        </div>
                        <div className="shrink-0">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* El padding y el ancho limitado van SOLO aquí */}
                <main className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
