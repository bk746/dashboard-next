import { FaUserPlus } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface NouveauClientCardProps {
  /** Nombre de clients dont le champ « dernière activité » tombe dans le mois courant */
  activiteCeMois: number;
}

export default function NouveauClientCard({ activiteCeMois }: NouveauClientCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Activité ce mois</p>
        <p className={kpiValueClass}>{activiteCeMois}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">
          Clients dont la dernière activité est datée ce mois-ci (pas des « nouveaux » au sens strict).
        </p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUserPlus className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
