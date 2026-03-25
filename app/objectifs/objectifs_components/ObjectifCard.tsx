import { FaBullseye } from "react-icons/fa";
import { appCardKpiColumn, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface ObjectifCardProps {
  type: "Financier" | "Client";
  objectif: number;
  actuel: number;
  libelle: string;
}

export default function ObjectifCard({ type, objectif, actuel, libelle }: ObjectifCardProps) {
  const progression = objectif > 0 ? Math.min((actuel / objectif) * 100, 100) : 0;
  const isCompleted = progression >= 100;

  return (
    <div className={appCardKpiColumn}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className={kpiLabelClass}>Objectif {type}</p>
          <p className={kpiValueClass}>
            {objectif.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""}
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            Actuel: {actuel.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""} / {objectif.toLocaleString("fr-FR")}{" "}
            {type === "Financier" ? "€" : ""}
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FaBullseye className={kpiIconClass} aria-hidden />
        </div>
      </div>

      <div className="w-full">
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 md:h-3 mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 md:duration-500 ${
              isCompleted ? "bg-emerald-500/80 dark:bg-emerald-500/70" : "bg-[#ED8600] dark:bg-[#5b7fb8]"
            }`}
            style={{ width: `${progression}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">{libelle}</p>
          <p
            className={`text-xs md:text-sm font-medium ${
              isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {isCompleted ? "100% - Objectif réussi" : `${progression.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
