"use client";

import { CalendarClock } from "lucide-react";
import type { ProspectRdvPlanningRow } from "@/app/prospection/prospection_utils";
import {
  appCardBase,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  secondaryButtonClass,
} from "@/app/components/appCardStyles";

interface RendezVousAVenirCardProps {
  items: ProspectRdvPlanningRow[];
  onOpenProspect: (prospectId: string) => void;
}

function isTodayFr(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function RendezVousAVenirCard({ items, onOpenProspect }: RendezVousAVenirCardProps) {
  const count = items.length;

  return (
    <div className={`${appCardBase} p-6 md:p-8`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex gap-4 sm:gap-5 lg:max-w-[280px] lg:flex-col lg:gap-4">
          <div className="hidden sm:flex lg:items-start">
            <CalendarClock className={`${kpiIconClass} shrink-0`} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className={kpiLabelClass}>Rendez-vous à venir</p>
            <p className={`${kpiValueClass} mt-1`}>{count}</p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
              RDV enregistrés sur les fiches prospects, à partir d&apos;aujourd&apos;hui, par ordre chronologique. Ouvrez la
              fiche pour voir le détail.
            </p>
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 border-t border-zinc-200/90 pt-6 dark:border-white/[0.08] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {count === 0 ? (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/50 px-4 py-8 text-center dark:border-white/[0.1] dark:bg-white/[0.02]">
              <CalendarClock className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-600" aria-hidden />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Aucun rendez-vous à venir</p>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                Ajoutez un RDV depuis une fiche prospect (section bas du formulaire).
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(320px,50vh)] space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
              {items.map((row) => {
                const d = new Date(row.debut);
                const today = isTodayFr(d);
                const dateLabel = d.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const timeLabel = d.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li
                    key={`${row.prospectId}-${row.rdvId}`}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-white/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.07] dark:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex min-w-0 items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                          <span className="truncate">{row.entreprise}</span>
                          {row.urgent ? (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                              title="Urgent — site critique"
                              aria-label="Urgent — site critique"
                            />
                          ) : null}
                        </span>
                        {today && (
                          <span className="rounded-full bg-[#ED8600]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b45309] dark:bg-[#5b7fb8]/25 dark:text-[#b8cce8]">
                            Aujourd&apos;hui
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <time dateTime={row.debut}>
                          {dateLabel} · {timeLabel}
                        </time>
                        {row.titre ? (
                          <span className="text-zinc-500 dark:text-zinc-500"> — {row.titre}</span>
                        ) : null}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenProspect(row.prospectId)}
                      className={`${secondaryButtonClass} shrink-0 self-start sm:self-center py-2 text-xs sm:text-sm`}
                    >
                      Voir la fiche
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
