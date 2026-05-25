"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface DashboardFinanceHintProps {
  montantImpayes: number;
  nbFacturesImpayees: number;
}

export default function DashboardFinanceHint({ montantImpayes, nbFacturesImpayees }: DashboardFinanceHintProps) {
  const hasImpayes = nbFacturesImpayees > 0;

  if (!hasImpayes) {
    return (
      <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-emerald-50/80 via-white to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(16,185,129,0.18)] dark:from-emerald-950/30 dark:via-[#12131a] dark:to-[#12131a] sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-300/80">
            Trésorerie
          </p>
          <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
            Aucune facture impayée pour le moment.
          </p>
        </div>
        <Link
          href="/finance"
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 sm:inline-flex"
        >
          Ouvrir Finance <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-amber-50/90 via-white to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(245,158,11,0.22)] dark:from-amber-950/30 dark:via-[#12131a] dark:to-[#12131a] sm:p-5">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-400/15"
        aria-hidden
      />
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700/85 dark:text-amber-300/85">
          Trésorerie
        </p>
        <p className="mt-0.5 truncate text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {montantImpayes.toLocaleString("fr-FR")} €
          </span>{" "}
          impayés
          <span className="text-zinc-500 dark:text-zinc-400">
            {" "}
            · {nbFacturesImpayees} facture{nbFacturesImpayees > 1 ? "s" : ""}
          </span>
        </p>
      </div>
      <Link
        href="/finance"
        className="relative hidden shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25 sm:inline-flex"
      >
        Traiter <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
