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
    <div className="group relative h-full overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#6C5DD3] via-[#5E549E] to-[#4a4088] p-6 shadow-[0_12px_40px_-12px_rgba(108,93,211,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-12px_rgba(108,93,211,0.65)] md:p-7">
      <div
        className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF8FA8]/15 blur-2xl"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-sm backdrop-blur-sm transition-transform group-hover:scale-105">
              <FaEuroSign className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">CA encaissé</p>
              <p className="text-[11px] text-white/65">Mois en cours</p>
            </div>
          </div>
          {hasPct ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur-sm ${
                isPositive
                  ? "bg-emerald-400/25 text-emerald-100"
                  : "bg-[#FF8FA8]/30 text-white"
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
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-white md:text-[44px] md:leading-[1.05]">
            {caMoisEncaisse.toLocaleString("fr-FR")} €
          </p>
          <p className="mt-2 text-xs text-white/65 md:text-sm">
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
