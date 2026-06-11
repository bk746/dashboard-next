"use client";

import { FaEuroSign } from "react-icons/fa";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CACardProps {
  /** CA encaissé (factures payées) sur le mois en cours */
  caMoisEncaisse: number;
  /** Variation vs mois précédent ; null si le mois précédent était à 0 (pas de % pertinent) */
  variationPct: number | null;
}

export default function CACard({ caMoisEncaisse, variationPct }: CACardProps) {
  const hasPct = variationPct !== null && !Number.isNaN(variationPct);
  const isPositive = hasPct && variationPct >= 0;

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)] md:p-7">
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3] transition-transform group-hover:scale-105">
              <FaEuroSign className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-[13px] font-medium text-zinc-700">CA encaissé</p>
              <p className="text-[11px] text-zinc-400">Mois en cours</p>
            </div>
          </div>
          {hasPct ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                isPositive ? "bg-emerald-500/12 text-emerald-700" : "bg-rose-500/12 text-rose-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {isPositive ? "+" : ""}
              {variationPct.toFixed(1)}%
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 md:text-[44px] md:leading-[1.05]">
            {caMoisEncaisse.toLocaleString("fr-FR")} €
          </p>
          <p className="mt-2 text-xs text-zinc-400 md:text-sm">
            {hasPct ? (
              <>vs mois précédent</>
            ) : caMoisEncaisse > 0 ? (
              <>Mois précédent sans encaissement</>
            ) : (
              <>Aucune facture encaissée ce mois</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
