import { FaCalendarAlt } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiIconClass } from "@/app/components/appCardStyles";

interface ProchaineEcheanceCardProps {
  prochaineEcheance: string | null;
}

export default function ProchaineEcheanceCard({ prochaineEcheance }: ProchaineEcheanceCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Prochaine échéance</p>
        <p className="text-zinc-900 dark:text-zinc-50 text-2xl md:text-[clamp(28px,3vw,40px)] font-semibold tracking-tight">
          {prochaineEcheance ?? "Aucune"}
        </p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300">
            Date fin
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">
            {prochaineEcheance ? "la plus proche" : "aucun projet à venir"}
          </span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaCalendarAlt className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
