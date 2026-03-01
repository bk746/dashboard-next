import { FaBullseye } from "react-icons/fa";

interface ProgressionTotalCardProps {
  progressionTotal: number;
}

export default function ProgressionTotalCard({ progressionTotal }: ProgressionTotalCardProps) {
  const percentage = Math.min(progressionTotal, 100);
  const isCompleted = progressionTotal >= 100;

  return (
    <div className="rounded-2xl md:rounded-xl p-6 md:p-8 h-full flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out
      bg-white dark:bg-black md:bg-linear-to-br md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] dark:md:from-black dark:md:via-black dark:md:to-blue-800 border border-neutral-300 dark:border-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl dark:md:shadow-none hover:scale-[1.01] md:hover:scale-103">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex flex-col gap-2 md:gap-1.5 flex-1 min-w-0">
          <p className="text-gray-500 dark:text-gray-400 md:text-[#ED8600] dark:md:text-blue-800 text-xs md:text-xl font-medium md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">Progression total</p>
          <p className="text-gray-800 dark:text-white md:text-gray-500 dark:md:text-gray-400 text-4xl md:text-[clamp(32px,4vw,48px)] font-bold tracking-tight tabular-nums">{percentage.toFixed(1)}%</p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FaBullseye className="h-12 w-12 sm:h-16 sm:w-16 text-[#ED8600]/80 dark:text-blue-800/80" />
        </div>
      </div>

      <div className="w-full">
        <div className="w-full bg-gray-100 dark:bg-gray-800 md:bg-gray-300 rounded-full h-3 md:h-4 mt-3 md:mt-4 relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 md:duration-500 ${isCompleted ? "bg-emerald-500" : "bg-[#ED8600] dark:bg-blue-800"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isCompleted && (
          <p className="text-emerald-600 dark:text-emerald-400 md:text-green-600 text-sm font-medium mt-2 text-right">Objectif réussi</p>
        )}
      </div>
    </div>
  );
}
