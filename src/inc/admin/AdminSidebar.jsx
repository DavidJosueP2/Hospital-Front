import React, { useContext } from "react";
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
import { NavLink, useNavigate } from "react-router-dom";
import logoUrl from "@/assets/favicon.ico";
import AuthContext from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/shadcn/dropdown-menu";
import Can from "@/utils/Can.jsx";

function NavItem({ to, icon: Icon, label, className = "", end = false }) {
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
                    end={end}
                    aria-label={label}
                    className={[
                        "group",
                        collapsed
                            ? "relative w-full grid place-items-center rounded-lg px-0 py-0.5"
                            : "relative w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 text-foreground/90 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground aria-[current=page]:ring-1 aria-[current=page]:ring-brand/20 aria-[current=page]:before:absolute aria-[current=page]:before:left-[-6px] aria-[current=page]:before:top-1/2 aria-[current=page]:before:-translate-y-1/2 aria-[current=page]:before:h-5 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-full aria-[current=page]:before:bg-brand",
                    ].join(" ")}
                >
          <span
              className={[
                  collapsed
                      ? "grid size-7 place-content-center shrink-0 rounded-md mx-0 my-0"
                      : "grid size-7 place-content-center shrink-0 rounded-md",
                  "bg-transparent hover:bg-brand-1/25",
                  collapsed
                      ? "group-aria-[current=page]:bg-accent group-aria-[current=page]:text-accent-foreground"
                      : "aria-[current=page]:bg-brand-1/40",
              ].join(" ")}
          >
            <Icon className={collapsed ? "size-3.5 shrink-0" : "size-4 shrink-0"} />
          </span>
                    {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

const NAV_ADMIN_INICIO = [{ to: "/admin", icon: Heart, label: "Dashboard" }];

const NAV_ADMIN_PLATAFORMA = [{ to: "/playground", icon: FolderKanban, label: "Playground" }];

const NAV_ADMIN_GESTION = [
    { to: "/employees", icon: UserCog, label: "Empleados" },
    { to: "/doctors", icon: Stethoscope, label: "Doctores" },
    { to: "/specialties", icon: ClipboardList, label: "Especialidades" },
    { to: "/centers", icon: Building2, label: "Centros médicos" },
];

const NAV_DOCTOR_GESTION = [
    { to: "/patients", icon: UserRound, label: "Pacientes" },
    { to: "/consultations", icon: ClipboardList, label: "Consultas médicas" },
];

const NAV_DOCS = [{ to: "/docs", icon: BookText, label: "Guías & Manuales" }];

export default function AdminSidebar() {
    const { state } = useSidebar();
    const { user, logout } = useContext(AuthContext);
    const collapsed = state === "collapsed";
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <Sidebar collapsible="icon" className="sidebar-surface border-r overflow-hidden">
            <SidebarHeader className={collapsed ? "px-4 pt-3 pb-3" : "px-4 pt-6 pb-4"}>
                <NavLink
                    to="/"
                    className={[
                        "group flex items-center gap-3 rounded-md outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        collapsed ? "justify-center px-0" : "",
                    ].join(" ")}
                >
                    <div className="relative grid size-9 shrink-0 rounded-xl overflow-hidden border border-[color-mix(in_oklab,var(--brand-1),transparent_55%)] bg-[color-mix(in_oklab,var(--brand-veil),transparent_78%)] backdrop-blur-md">
                        <img src={logoUrl} alt="HQ" className="w-full h-full object-contain" />
                        <span
                            aria-hidden
                            className="absolute inset-0 rounded-xl pointer-events-none [background:conic-gradient(from_20deg_at_50%_50%,color-mix(in_oklab,var(--brand-1),transparent_85%),color-mix(in_oklab,var(--brand-2),transparent_88%),color-mix(in_oklab,var(--brand-3),transparent_85%),color-mix(in_oklab,#8ad2ff,transparent_90%),color-mix(in_oklab,#ffd38a,transparent_90%),color-mix(in_oklab,var(--brand-2),transparent_88%))] mix-blend-screen opacity-70 [padding:1px] [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] [-webkit-mask-composite:xor]"
                        />
                    </div>
                    {!collapsed && (
                        <div className="leading-tight">
                            <p className="text-[1.05rem] font-semibold tracking-tight">
                                H<span className="text-sm relative -top-[1px]">&</span>Q Hospital
                            </p>
                            <p className="text-[0.8rem] text-muted-foreground">Administración</p>
                        </div>
                    )}
                </NavLink>
            </SidebarHeader>

            <SidebarContent className={collapsed ? "px-1 overflow-hidden" : "px-2 overflow-hidden"}>
                <Can allowedRoles={["ADMIN"]}>
                    <SidebarGroup>
                        <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Inicio</SidebarGroupLabel>
                        <SidebarGroupContent className="overflow-hidden">
                            <SidebarMenu>
                                {NAV_ADMIN_INICIO.map((item) => (
                                    <NavItem key={item.to} {...item} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarSeparator className="sidebar-divider my-2" />
                </Can>

                <Can allowedRoles={["ADMIN"]}>
                    <SidebarGroup>
                        <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Plataforma</SidebarGroupLabel>
                        <SidebarGroupContent className="overflow-hidden">
                            <SidebarMenu>
                                {NAV_ADMIN_PLATAFORMA.map((item) => (
                                    <NavItem key={item.to} {...item} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarSeparator className="sidebar-divider my-2" />
                </Can>

                <SidebarGroup>
                    <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Gestión clínica</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            <Can allowedRoles={["ADMIN"]}>
                                {NAV_ADMIN_GESTION.map((item) => (
                                    <NavItem key={item.to} {...item} />
                                ))}
                            </Can>
                            <Can allowedRoles={["DOCTOR"]}>
                                {NAV_DOCTOR_GESTION.map((item) => (
                                    <NavItem key={item.to} {...item} />
                                ))}
                            </Can>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="sidebar-divider my-2" />

                <SidebarGroup>
                    <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Documentación</SidebarGroupLabel>
                    <SidebarGroupContent className="overflow-hidden">
                        <SidebarMenu>
                            {NAV_DOCS.map((item) => (
                                <NavItem key={item.to} {...item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className={collapsed ? "mt-auto border-t px-2 pt-2 pb-1" : "mt-auto border-t px-3 py-3"}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={collapsed ? "Cuenta" : undefined}
                                    className={collapsed ? "justify-center px-0" : "justify-start"}
                                >
                                    <button
                                        type="button"
                                        className={collapsed ? "h-9 w-9 grid place-items-center rounded-md" : "w-full cursor-pointer"}
                                        aria-label="Cuenta"
                                    >
                                        <Avatar className={collapsed ? "size-7 shrink-0" : "size-8 shrink-0"}>
                                            <AvatarImage src="https://i.pravatar.cc/64?img=3" alt="@user" />
                                            <AvatarFallback>
                                                {user ? user.first_name[0] + user.last_name[0] : "U"}
                                            </AvatarFallback>
                                        </Avatar>

                                        {!collapsed && (
                                            <div className="grid grow truncate text-left ml-2">
                        <span className="truncate text-sm font-medium">
                          {user ? `${user.first_name} ${user.last_name}` : "Usuario"}
                        </span>
                                                <span className="truncate text-xs text-muted-foreground">
                          {user?.email ?? "sin correo"}
                        </span>
                                            </div>
                                        )}
                                    </button>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" side="top" className="w-48">
                                <DropdownMenuItem disabled>
                                    {user ? `${user.first_name} ${user.last_name}` : "Usuario"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-100">
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
