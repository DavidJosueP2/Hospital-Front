// src/components/ui/typography/Heading.jsx
import React from "react";
import { Separator } from "@/components/ui/shadcn/separator";

/**
 * Títulos profesionales con estética clínica (turquesa pastel), listos para dark/light.
 * - PageHeading: bloque hero con icono opcional, kicker, título y acciones.
 * - SectionHeading: encabezado de sección con barra/acento.
 * - SubSectionHeading: subtítulo compacto con marcador sutil.
 */

export function PageHeading({
                                title,
                                subtitle,
                                kicker,
                                icon: Icon,
                                actions,
                                className = "",
                                children,
                            }) {
    return (
        <div
            className={[
                "relative overflow-hidden rounded-2xl border bg-card/70 card-glass",
                "px-5 py-5 md:px-8 md:py-7",
                className,
            ].join(" ")}
        >
            {/* Fondo decorativo suave */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-surface-gradient" />
            {/* Halo diagonal muy sutil */}
            <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-brand-3/30 blur-3xl dark:bg-brand-3/20" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    {Icon ? (
                        <div
                            className={[
                                "grid size-12 place-content-center shrink-0 rounded-xl shadow-sm",
                                "ring-1 ring-brand/25 bg-brand-gradient text-brand-contrast",
                            ].join(" ")}
                        >
                            <Icon className="size-5" />
                        </div>
                    ) : null}

                    <div className="min-w-0">
                        {kicker ? (
                            <div className="mb-1 text-xs font-medium uppercase tracking-widest text-brand">
                                {kicker}
                            </div>
                        ) : null}

                        <h1
                            className={[
                                "text-balance text-2xl font-semibold tracking-tight md:text-3xl",
                                "bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] bg-clip-text text-transparent",
                            ].join(" ")}
                        >
                            {title}
                        </h1>

                        {subtitle ? (
                            <p className="mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>
                        ) : null}
                    </div>
                </div>

                {actions ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
                ) : null}
            </div>

            {children ? <div className="mt-4">{children}</div> : null}

            <div className="mt-5">
                <Separator className="h-[1px] bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--brand-1),transparent_60%)] to-transparent" />
            </div>
        </div>
    );
}

export function SectionHeading({ title, subtitle, icon: Icon, className = "", actions }) {
    return (
        <div className={["mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className].join(" ")}>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    {Icon ? (
                        <span className="grid size-7 place-content-center rounded-lg bg-brand-3/50 text-brand ring-1 ring-brand/20">
              <Icon className="size-4" />
            </span>
                    ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_0_4px] shadow-[color-mix(in_oklab,var(--brand-1),transparent_80%)]" />
                    )}
                    <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground/95">
                        {title}
                    </h2>
                </div>
                {subtitle ? (
                    <p className="ml-9 mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
            </div>

            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}

export function SubSectionHeading({ title, subtitle, className = "" }) {
    return (
        <div className={["mb-2", className].join(" ")}>
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-brand" />
                <h3 className="text-base font-medium leading-none tracking-tight">{title}</h3>
            </div>
            {subtitle ? (
                <p className="ml-8 mt-1 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
        </div>
    );
}
