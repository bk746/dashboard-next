import { FaBullseye } from "react-icons/fa";
import { appCardKpi, kpiLabelDangerClass, kpiValueClass, kpiIconDangerClass } from "@/app/components/appCardStyles";

interface EnRetardCardProps {
  enRetard: number;
}

export default function EnRetardCard({ enRetard }: EnRetardCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelDangerClass}>En retard</p>
        <p className={kpiValueClass}>{enRetard.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">
          Non payées, date de facture avant aujourd&apos;hui (toutes périodes).
        </p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/12 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300">
            Impayé
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">à relancer</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaBullseye className={kpiIconDangerClass} aria-hidden />
      </div>
    </div>
  );
}
