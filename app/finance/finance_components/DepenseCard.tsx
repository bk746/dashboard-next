"use client";

import { FaWallet } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface DepenseCardProps {
  total: number;
  totalRecurrent: number;
  totalOccasionnel: number;
  /** Libellé court sous le montant (ex. période) */
  periodHint: string;
}

export default function DepenseCard({ total, totalRecurrent, totalOccasionnel, periodHint }: DepenseCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Dépenses</p>
        <p className={kpiValueClass}>{total.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">{periodHint}</p>
        <div className="flex flex-col gap-1 mt-1 md:mt-2">
          {totalRecurrent > 0 && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/12 text-amber-900 dark:text-amber-300 text-xs">
                Récurrent / mois
              </span>
              <span>{totalRecurrent.toLocaleString("fr-FR")} €</span>
            </div>
          )}
          {totalOccasionnel > 0 && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
              <span className="px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 text-xs">
                Occasionnel
              </span>
              <span>{totalOccasionnel.toLocaleString("fr-FR")} €</span>
            </div>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaWallet className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
