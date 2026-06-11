"use client";

import { Users, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ClientsActifCardProps {
  clientsActifs: number;
  /** Écart du nombre de clients actifs ayant une activité datée ce mois vs le mois précédent (champ « dernière activité ») */
  deltaActiviteVsMoisPrec: number;
}

export default function ClientsActifCard({ clientsActifs, deltaActiviteVsMoisPrec }: ClientsActifCardProps) {
  const isPositive = deltaActiviteVsMoisPrec > 0;
  const isNeutral = deltaActiviteVsMoisPrec === 0;
  const absDelta = Math.abs(deltaActiviteVsMoisPrec);
  const label = absDelta <= 1 ? "client" : "clients";

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)] md:p-7">
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E97B9C]/12 text-[#D84A75] transition-transform group-hover:scale-105">
              <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-[13px] font-medium text-zinc-700">Clients actifs</p>
              <p className="text-[11px] text-zinc-400">Statut « Actif »</p>
            </div>
          </div>
          {isNeutral ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
              <Minus className="h-3 w-3" aria-hidden />
              stable
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                isPositive ? "bg-emerald-500/12 text-emerald-700" : "bg-rose-500/12 text-rose-700"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              )}
              {isPositive ? "+" : "−"}
              {absDelta}
            </span>
          )}
        </div>

        <div>
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 md:text-[44px] md:leading-[1.05]">
            {clientsActifs}
          </p>
          <p className="mt-2 text-xs text-zinc-400 md:text-sm">
            {isNeutral
              ? "Même niveau d'activité qu'au mois précédent"
              : `${absDelta} ${label} ${isPositive ? "de plus" : "de moins"} ce mois`}
          </p>
        </div>
      </div>
    </div>
  );
}
