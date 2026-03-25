import { FaUsers } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface ProjetsActifsCardProps {
  /** Projets hors statut « Terminé » (pipeline) */
  projetsEnCours: number;
}

export default function ProjetsActifsCard({ projetsEnCours }: ProjetsActifsCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Projets en cours</p>
        <p className={kpiValueClass}>{projetsEnCours}</p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300">
            Pipeline
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">hors terminés</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUsers className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
