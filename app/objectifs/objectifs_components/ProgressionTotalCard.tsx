import { FaBullseye } from "react-icons/fa";
import { appCardBase, kpiLabelClass } from "@/app/components/appCardStyles";

interface ProgressionTotalCardProps {
  progressionTotal: number;
}

export default function ProgressionTotalCard({ progressionTotal }: ProgressionTotalCardProps) {
  const percentage = Math.min(progressionTotal, 100);
  const isCompleted = progressionTotal >= 100;

  return (
    <div
      className={`${appCardBase} p-6 md:p-8 h-full flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex flex-col gap-2 md:gap-1.5 flex-1 min-w-0">
          <p className={`${kpiLabelClass} md:text-xl`}>Progression total</p>
          <p className="text-zinc-900 dark:text-zinc-50 text-4xl md:text-[clamp(32px,4vw,48px)] font-semibold tracking-tight tabular-nums">
            {percentage.toFixed(1)}%
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FaBullseye className="h-12 w-12 sm:h-16 sm:w-16 text-[#ED8600]/25 dark:text-[#8fa9c9]/20" aria-hidden />
        </div>
      </div>

      <div className="w-full">
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 md:h-4 mt-3 md:mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 md:duration-500 ${
              isCompleted ? "bg-emerald-500/80 dark:bg-emerald-500/70" : "bg-[#ED8600] dark:bg-[#5b7fb8]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isCompleted && (
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2 text-right">Objectif réussi</p>
        )}
      </div>
    </div>
  );
}
