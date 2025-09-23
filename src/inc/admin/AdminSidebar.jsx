import React from "react";
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
} from "@/components/ui/shadcn/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/shadcn/avatar";
import {
    Building2,
    Heart,
    FolderKanban,
    Stethoscope,
    BookText,
    UserRound,
    UserCog,
    ClipboardList,
} from "lucide-react";
import { NavLink } from "react-router-dom";

/** Ítem reutilizable: centra ícono cuando el sidebar está colapsado */
function NavItem({ to, icon: Icon, label, className = "" }) {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={collapsed ? label : undefined}
                className={`${collapsed ? "justify-center px-0" : "justify-start"} ${className}`}
            >
                <NavLink
                    to={to}
                    className="w-full data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export default function AdminSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const MENU = {
        home: [{ to: "/admin", icon: Heart, label: "Dashboard" }],
        platform: [{ to: "/admin/playground", icon: FolderKanban, label: "Playground" }],
        clinic: [
            { to: "/admin/employees", icon: UserCog, label: "Empleados" },
            { to: "/admin/doctors", icon: Stethoscope, label: "Doctores" },
            { to: "/admin/patients", icon: UserRound, label: "Pacientes" },
            { to: "/admin/specialties", icon: ClipboardList, label: "Especialidades" },
            { to: "/admin/centers", icon: Building2, label: "Centros médicos" },
            { to: "/admin/consultations", icon: ClipboardList, label: "Consultas médicas" },
        ],
        docs: [{ to: "/docs", icon: BookText, label: "Guías & Manuales" }],
    };

    return (
        <Sidebar collapsible="icon" className="border-r overflow-hidden">
            {/* Header: centra el logo cuando está colapsado */}
            <SidebarHeader className="px-4 py-3">
                <NavLink
                    to="/admin"
                    className={`flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        collapsed ? "justify-center" : ""
                    }`}
                >
                    <div className="grid size-8 aspect-square shrink-0 place-content-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                        <Heart className="size-4" />
                    </div>
                    {!collapsed && (
                        <div className="leading-tight">
                            <p className="text-base font-semibold">ClinicCare</p>
                            <p className="text-xs text-muted-foreground">Administración</p>
                        </div>
                    )}
                </NavLink>
            </SidebarHeader>

            {/* Contenido */}
            <SidebarContent className="px-2 overflow-hidden">
                <SidebarGroup>
                    <SidebarGroupLabel>Inicio</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            {MENU.home.map((it) => (
                                <NavItem key={it.to} {...it} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            {MENU.platform.map((it) => (
                                <NavItem key={it.to} {...it} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Gestión clínica</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            {MENU.clinic.map((it) => (
                                <NavItem key={it.to} {...it} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Documentación</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            {MENU.docs.map((it) => (
                                <NavItem key={it.to} {...it} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer: centra el avatar cuando está colapsado */}
            <SidebarFooter className="border-t px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className={collapsed ? "justify-center px-0" : "justify-start"}
                        >
                            <button type="button" className="w-full cursor-default" tabIndex={-1}>
                                <Avatar className="size-8 shrink-0">
                                    <AvatarImage src="https://i.pravatar.cc/64?img=3" alt="@shadcn" />
                                    <AvatarFallback>SC</AvatarFallback>
                                </Avatar>
                                {!collapsed && (
                                    <div className="grid grow truncate text-left">
                                        <span className="truncate text-sm font-medium">shadcn</span>
                                        <span className="truncate text-xs text-muted-foreground">m@example.com</span>
                                    </div>
                                )}
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
