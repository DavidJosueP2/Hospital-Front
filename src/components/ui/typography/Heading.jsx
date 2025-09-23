import React from "react";
import { Separator } from "@/components/ui/shadcn/separator";
import { Stars } from "lucide-react";

export function PageHeading({
                                title,
                                subtitle,
                                kicker,
                                icon: Icon,                 // icono grande opcional a la izquierda del bloque
                                titleIcon: TitleIcon = Stars, // icono en burbuja a la izquierda del TÍTULO
                                actions,
                                className = "",
                                children,
                            }) {
    return (
        <div
            className={[
                "relative w-full overflow-hidden hero-surface",
                "px-6 py-10 sm:px-10 md:py-12 lg:px-14",
                "bg-hero-mint",
                className,
            ].join(" ")}
        >
            <div className="pointer-events-none absolute inset-0 glass-edge" />
            <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full"
                 style={{ backgroundImage: "radial-gradient(closest-side, color-mix(in oklab, var(--brand-2), white 30%) 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full"
                 style={{ backgroundImage: "radial-gradient(closest-side, color-mix(in oklab, var(--brand-3), white 30%) 0%, transparent 70%)" }} />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    {Icon ? (
                        <div
                            className={[
                                "grid size-12 place-content-center shrink-0 rounded-xl shadow-sm",
                                "ring-1 ring-black/5 bg-white/60 text-foreground dark:bg-white/10 dark:ring-white/10",
                            ].join(" ")}
                        >
                            <Icon className="size-5" />
                        </div>
                    ) : null}

                    <div className="min-w-0">
                        {kicker ? (
                            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/70">
                                {kicker}
                            </div>
                        ) : null}

                        <div className="flex items-center gap-3">
                            {TitleIcon ? (
                                <span className="title-bubble size-9">
                  <TitleIcon className="size-5" />
                </span>
                            ) : null}

                            <h1 className="text-3xl font-extrabold tracking-tight leading-tight md:text-4xl text-foreground">
                                {title}
                            </h1>
                        </div>

                        {subtitle ? (
                            <p className="mt-2 max-w-prose text-sm md:text-base text-foreground/75">{subtitle}</p>
                        ) : null}
                    </div>
                </div>

                {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>

            {children ? <div className="relative z-10 mt-5">{children}</div> : null}

            <div className="relative z-10 mt-6">
                <Separator className="h-[1px] bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--brand),transparent_70%)] to-transparent" />
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
                        <span className="grid size-7 place-content-center rounded-lg bg-brand-1/60 text-foreground ring-1 ring-black/5">
              <Icon className="size-4" />
            </span>
                    ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_0_4px] shadow-[color-mix(in_oklab,var(--brand),transparent_80%)]" />
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
                <h3 className="text-base font-semibold leading-none tracking-tight">{title}</h3>
            </div>
            {subtitle ? (
                <p className="ml-8 mt-1 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
        </div>
    );
}
