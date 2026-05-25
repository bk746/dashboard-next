"use client";

import { Bell, FileText, Users, type LucideIcon } from "lucide-react";

export type ProspectionRelanceMiniKind = "encours" | "audit" | "relance";

interface ToneConfig {
  title: string;
  sub: string;
  Icon: LucideIcon;
  surface: string;
  iconWrap: string;
  accent: string;
}

const config: Record<ProspectionRelanceMiniKind, ToneConfig> = {
  encours: {
    title: "Prospects en cours",
    sub: "Réponse en attente",
    Icon: Users,
    surface: "bg-white dark:bg-[#12131a]",
    iconWrap:
      "bg-zinc-100 text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300",
    accent: "text-zinc-500 dark:text-zinc-400",
  },
  audit: {
    title: "Audit à faire",
    sub: "Pas encore envoyé",
    Icon: FileText,
    surface:
      "bg-gradient-to-br from-sky-50/80 via-white to-white dark:from-sky-950/40 dark:via-[#12131a] dark:to-[#12131a]",
    iconWrap:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    accent: "text-sky-700/80 dark:text-sky-300/80",
  },
  relance: {
    title: "À relancer",
    sub: "Échéance atteinte",
    Icon: Bell,
    surface:
      "bg-gradient-to-br from-amber-50/90 via-white to-white dark:from-amber-950/45 dark:via-[#12131a] dark:to-[#12131a]",
    iconWrap:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    accent: "text-amber-800/85 dark:text-amber-300/85",
  },
};

interface ProspectionRelanceMiniCardProps {
  kind: ProspectionRelanceMiniKind;
  value: number;
}

export default function ProspectionRelanceMiniCard({ kind, value }: ProspectionRelanceMiniCardProps) {
  const c = config[kind];
  const Icon = c.Icon;
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-0 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.6)] ${c.surface}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${c.iconWrap}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          {value}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</p>
        <p className={`mt-0.5 text-xs ${c.accent}`}>{c.sub}</p>
      </div>
    </div>
  );
}
