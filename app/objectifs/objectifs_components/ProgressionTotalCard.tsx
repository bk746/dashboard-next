import { FaBullseye } from "react-icons/fa";

interface ProgressionTotalCardProps {
  progressionTotal: number;
}

export default function ProgressionTotalCard({ progressionTotal }: ProgressionTotalCardProps) {
  const percentage = Math.min(progressionTotal, 100);
  const isCompleted = progressionTotal >= 100;

  return (
    <div className="border border-neutral-700 rounded-xl p-8 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex flex-col justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-neutral-400 text-xl font-semibold">Progression total</h3>
          <p className="text-white text-[clamp(32px,4vw,48px)] font-bold">{percentage.toFixed(1)}%</p>
        </div>
        <div className="hidden sm:block">
          <FaBullseye className="h-12 w-12 sm:h-16 sm:w-16 p-1.5 bg-transparent rounded-xl text-white" />
        </div>
      </div>
      
      <div className="w-full">
        <div className="w-full bg-gray-700 rounded-full h-4 mt-4 relative overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              isCompleted ? "bg-green-500" : "bg-teal-400"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {isCompleted && (
          <p className="text-green-400 text-sm font-medium mt-2 text-right">🎉 Objectif réussi !</p>
        )}
      </div>
    </div>
  );
}
