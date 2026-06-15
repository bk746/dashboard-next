"use client";

import Link from "next/link";
import { CalendarDays, Check, Target } from "lucide-react";
import { primaryButtonClass } from "@/app/components/appCardStyles";

export type ObjectifSemaineItem = {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  actuel: number;
};

interface ObjectifsSemaineCardProps {
  items: ObjectifSemaineItem[];
  weekLabel: string;
}

const cardClass =
  "overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

function formatValue(type: "Financier" | "Client", n: number) {
  return type === "Financier" ? `${n.toLocaleString("fr-FR")} €` : n.toLocaleString("fr-FR");
}

export default function ObjectifsSemaineCard({ items, weekLabel }: ObjectifsSemaineCardProps) {
  if (items.length === 0) {
    return (
      <section aria-label="Objectifs de la semaine" className={cardClass}>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#007AFF]">
                Objectifs de la semaine
              </p>
              <p className="mt-1 text-sm capitalize text-zinc-500">{weekLabel}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            Aucun objectif hebdomadaire. Créez-en un avec la période « Semaine en cours » dans Objectifs.
          </p>
          <Link href="/objectifs" className={`${primaryButtonClass} mt-4 inline-flex`}>
            Créer un objectif semaine
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Objectifs de la semaine" className={cardClass}>
      <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">Objectifs de la semaine</h2>
              <p className="mt-0.5 text-sm capitalize text-zinc-500">{weekLabel}</p>
            </div>
          </div>
          <Link
            href="/objectifs"
            className="shrink-0 text-sm font-medium text-[#007AFF] transition-opacity hover:opacity-80"
          >
            Gérer
          </Link>
        </div>
      </div>

      <ul className="divide-y divide-zinc-100">
        {items.map((item) => {
          const pct = item.objectif > 0 ? Math.min((item.actuel / item.objectif) * 100, 100) : 0;
          const done = pct >= 100;
          return (
            <li key={item.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                      <Target className="h-3 w-3" aria-hidden />
                      {item.type}
                    </span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" aria-hidden />
                        Atteint
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-zinc-900" title={item.libelle}>
                    {item.libelle}
                  </p>
                  <p className="mt-1 text-sm tabular-nums text-zinc-500">
                    {formatValue(item.type, item.actuel)}
                    <span className="text-zinc-400"> / </span>
                    {formatValue(item.type, item.objectif)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[#007AFF]">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#007AFF]/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    done ? "bg-emerald-500" : "bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]"
                  }`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progression ${item.libelle}`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
