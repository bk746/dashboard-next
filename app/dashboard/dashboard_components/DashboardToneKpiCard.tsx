"use client";

import type { ReactNode } from "react";

export type DashboardTone = "violet" | "pink";

const toneStyles: Record<
  DashboardTone,
  { shell: string; hover: string; blob: string }
> = {
  violet: {
    shell:
      "bg-gradient-to-br from-[#6C5DD3] via-[#5E549E] to-[#4a4088] shadow-[0_12px_40px_-12px_rgba(108,93,211,0.5)]",
    hover: "hover:shadow-[0_16px_48px_-12px_rgba(108,93,211,0.62)]",
    blob: "bg-white/10",
  },
  pink: {
    shell:
      "bg-gradient-to-br from-[#F08A9B] via-[#E97B9C] to-[#D84A75] shadow-[0_12px_40px_-12px_rgba(233,123,156,0.5)]",
    hover: "hover:shadow-[0_16px_48px_-12px_rgba(233,123,156,0.62)]",
    blob: "bg-white/12",
  },
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

export default function DashboardToneKpiCard({
  tone,
  label,
  value,
  subtitle,
  footer,
  icon,
  valueClassName = "text-3xl font-semibold tabular-nums tracking-tight text-white md:text-[36px] md:leading-[1.05]",
}: DashboardToneKpiCardProps) {
  const s = toneStyles[tone];

  return (
    <div
      className={`group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-3xl border-0 p-6 transition-all duration-300 hover:-translate-y-1 ${s.shell} ${s.hover} md:p-7`}
    >
      <div
        className={`pointer-events-none absolute -right-14 -bottom-14 h-48 w-48 rounded-full blur-3xl ${s.blob}`}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">{label}</p>
          {subtitle ? <p className="mt-0.5 text-[11px] leading-snug text-white/65">{subtitle}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm transition-transform group-hover:scale-105 [&_svg]:h-5 [&_svg]:w-5">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="relative mt-4">
        <div className={valueClassName}>{value}</div>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/** Pastille lisible sur fond violet ou rose */
export function DashboardToneBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "warn" | "success";
}) {
  const cls =
    variant === "warn"
      ? "bg-white/30 text-white"
      : variant === "success"
        ? "bg-emerald-300/25 text-emerald-50"
        : "bg-white/20 text-white";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
