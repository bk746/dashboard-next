import { FaEuroSign } from "react-icons/fa";
import {
  dashboardCardKpi,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  badgePositiveClass,
  badgeNegativeClass,
} from "@/app/components/appCardStyles";

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
    <div className={dashboardCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>CA encaissé</p>
        <p className={kpiValueClass}>{caMoisEncaisse.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">Mois en cours (factures payées)</p>
        <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2">
          {hasPct ? (
            <>
              <span className={isPositive ? badgePositiveClass : badgeNegativeClass}>
                {isPositive ? "+" : ""}
                {variationPct.toFixed(1)}%
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">vs mois précédent</span>
            </>
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
              {caMoisEncaisse > 0 ? "Mois précédent sans encaissement — variation en % indisponible." : "—"}
            </span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaEuroSign className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
