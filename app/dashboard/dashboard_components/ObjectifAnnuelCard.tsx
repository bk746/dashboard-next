import Link from "next/link";
import { FaBullseye } from "react-icons/fa";
import {
  dashboardCardKpi,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  primaryButtonClass,
} from "@/app/components/appCardStyles";

interface ObjectifAnnuelCardProps {
  /** Montant encaissé sur la période de l’objectif (année, mois ou semaine). */
  montantActuel: number;
  objectif: number;
  progression: number;
  /** Libellé de l’objectif financier suivi */
  objectifLibelle?: string;
  /** Sous-titre sous le montant (période de comparaison). */
  encaisseDescription?: string;
}

export default function ObjectifAnnuelCard({
  montantActuel,
  objectif,
  progression,
  objectifLibelle,
  encaisseDescription = "CA encaissé sur l'année civile en cours",
}: ObjectifAnnuelCardProps) {
  const percentage = Math.min(progression, 100);
  const isCompleted = progression >= 100;
  const hasObjectif = objectif > 0;

  if (!hasObjectif) {
    return (
      <div className={dashboardCardKpi}>
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className={kpiLabelClass}>Objectif financier</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Aucun objectif de type « Financier » n&apos;est défini. Créez-en un pour suivre votre progression (année, mois ou semaine).
          </p>
          <Link href="/objectifs" className={`${primaryButtonClass} mt-2 w-full text-center sm:w-auto`}>
            Définir un objectif
          </Link>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FaBullseye className={kpiIconClass} aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Objectif financier</p>
        {objectifLibelle ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2" title={objectifLibelle}>
            {objectifLibelle}
          </p>
        ) : null}
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">{encaisseDescription}</p>
        <p className={kpiValueClass}>{montantActuel.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">
          sur {objectif.toLocaleString("fr-FR")} €
        </p>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-emerald-500/80 dark:bg-emerald-500/70"
                : "bg-[#ED8600] dark:bg-[#5b7fb8]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isCompleted && (
          <p className="text-emerald-700 dark:text-emerald-400/90 text-xs text-right mt-1">100% atteint</p>
        )}
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaBullseye className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
