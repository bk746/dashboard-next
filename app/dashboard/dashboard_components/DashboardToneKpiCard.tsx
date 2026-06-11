"use client";

import type { ReactNode } from "react";

export type DashboardTone = "violet" | "pink";

const iconToneStyles: Record<DashboardTone, string> = {
  violet: "bg-[#6C5DD3]/10 text-[#6C5DD3]",
  pink: "bg-[#E97B9C]/12 text-[#D84A75]",
};

export interface DashboardToneKpiCardProps {
  tone: DashboardTone;
  label: string;
  value: ReactNode;
  subtitle?: string;
  footer?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
}

/** Carte KPI minimaliste — fond blanc, grand chiffre, accent de teinte sur l’icône seulement. */
export default function DashboardToneKpiCard({
  tone,
  label,
  value,
  subtitle,
  footer,
  icon,
  valueClassName = "text-[28px] font-semibold tabular-nums tracking-tight text-zinc-900 md:text-[32px] md:leading-[1.05]",
}: DashboardToneKpiCardProps) {
  return (
    <div className="group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)] md:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-zinc-500">{label}</p>
          {subtitle ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{subtitle}</p> : null}
        </div>
        {icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 [&_svg]:h-[18px] [&_svg]:w-[18px] ${iconToneStyles[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className={valueClassName}>{value}</div>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/** Pastille discrète sur carte blanche */
export function DashboardToneBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "warn" | "success";
}) {
  const cls =
    variant === "warn"
      ? "bg-amber-500/12 text-amber-700"
      : variant === "success"
        ? "bg-emerald-500/12 text-emerald-700"
        : "bg-zinc-100 text-zinc-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
