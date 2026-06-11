"use client";

import type { ReactNode } from "react";

export type FinanceStatTone = "neutral" | "positive" | "negative" | "warning";

interface FinanceStatCardProps {
  label: string;
  value: string | number;
  /** Petite ligne grise sous la valeur. */
  hint?: string;
  tone?: FinanceStatTone;
  icon?: ReactNode;
}

const valueToneClass: Record<FinanceStatTone, string> = {
  neutral: "text-zinc-900",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  warning: "text-amber-600",
};

/** Carte KPI minimaliste — fond blanc, grand chiffre, hiérarchie typographique sobre. */
export default function FinanceStatCard({ label, value, hint, tone = "neutral", icon }: FinanceStatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-zinc-500">{label}</p>
        {icon ? <span className="text-zinc-300 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span> : null}
      </div>
      <p className={`mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums ${valueToneClass[tone]}`}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}
