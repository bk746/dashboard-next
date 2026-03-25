import { FaUsers } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface EnAttenteCardProps {
  enAttente: number;
  periodHint: string;
}

export default function EnAttenteCard({ enAttente, periodHint }: EnAttenteCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>En attente</p>
        <p className={kpiValueClass}>{enAttente.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">{periodHint}</p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/12 text-amber-900 dark:text-amber-500/12 dark:text-amber-200">
            Non payé
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">factures</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUsers className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
