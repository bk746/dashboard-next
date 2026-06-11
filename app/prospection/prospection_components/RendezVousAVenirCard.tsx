"use client";

import { CalendarClock, ChevronRight } from "lucide-react";
import type { ProspectRdvPlanningRow } from "@/app/prospection/prospection_utils";

interface RendezVousAVenirCardProps {
  items: ProspectRdvPlanningRow[];
  onOpenProspect: (prospectId: string) => void;
}

const floatingCard =
  "overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

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
    <div className={floatingCard}>
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
            <CalendarClock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-zinc-900">Rendez-vous à venir</p>
            <p className="text-xs text-zinc-500">
              {count === 0
                ? "Aucun RDV planifié"
                : `${count} ${count > 1 ? "rendez-vous" : "rendez-vous"} à partir d'aujourd'hui`}
            </p>
          </div>
        </div>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#6C5DD3]">{count}</p>
      </div>

      {count === 0 ? (
        <div className="px-5 py-8 text-center sm:px-6">
          <p className="text-sm text-zinc-500">
            Ajoutez un RDV depuis une fiche prospect (bas du formulaire).
          </p>
        </div>
      ) : (
        <ul className="max-h-[min(320px,50vh)] divide-y divide-zinc-100 overflow-y-auto">
          {items.map((row) => {
            const d = new Date(row.debut);
            const today = isTodayFr(d);
            const dateLabel = d.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const timeLabel = d.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <li key={`${row.prospectId}-${row.rdvId}`}>
                <button
                  type="button"
                  onClick={() => onOpenProspect(row.prospectId)}
                  className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[#6C5DD3]/[0.04] sm:px-6"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
                      today
                        ? "bg-[#6C5DD3] text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    <span className="text-base font-semibold leading-none tabular-nums">
                      {d.getDate()}
                    </span>
                    <span className="mt-0.5 text-[10px] uppercase leading-none opacity-80">
                      {d.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-zinc-900">{row.entreprise}</span>
                      {row.urgent ? (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                          title="Urgent — site critique"
                          aria-label="Urgent"
                        />
                      ) : null}
                      {today ? (
                        <span className="rounded-full bg-[#6C5DD3]/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-[#6C5DD3]">
                          Aujourd&apos;hui
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      <time dateTime={row.debut}>
                        {dateLabel} · {timeLabel}
                      </time>
                      {row.titre ? <span className="text-zinc-400"> — {row.titre}</span> : null}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6C5DD3]"
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
