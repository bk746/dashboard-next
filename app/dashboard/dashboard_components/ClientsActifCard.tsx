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
    <div className="group relative h-full overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#F08A9B] via-[#E97B9C] to-[#D84A75] p-6 shadow-[0_12px_40px_-12px_rgba(233,123,156,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-12px_rgba(233,123,156,0.65)] md:p-7">
      <div
        className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-white/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm backdrop-blur-sm transition-transform group-hover:scale-105">
              <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">Clients actifs</p>
              <p className="text-[11px] text-white/70">Statut « Actif »</p>
            </div>
          </div>
          {isNeutral ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Minus className="h-3 w-3" aria-hidden />
              stable
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur-sm ${
                isPositive ? "bg-white/25 text-white" : "bg-[#9c3d55]/40 text-white"
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
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-white md:text-[44px] md:leading-[1.05]">
            {clientsActifs}
          </p>
          <p className="mt-2 text-xs text-white/70 md:text-sm">
            {isNeutral
              ? "Même niveau d'activité qu'au mois précédent"
              : `${absDelta} ${label} ${isPositive ? "de plus" : "de moins"} ce mois`}
          </p>
        </div>
      </div>
    </div>
  );
}
