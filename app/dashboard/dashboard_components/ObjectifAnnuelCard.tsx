import { FaBullseye } from "react-icons/fa";

interface ObjectifAnnuelCardProps {
  caActuel: number;
  objectif: number;
  progression: number;
}

export default function ObjectifAnnuelCard({ caActuel, objectif, progression }: ObjectifAnnuelCardProps) {
  const percentage = Math.min(progression, 100);
  const isCompleted = progression >= 100;

  return (
    <div className="rounded-2xl md:rounded-xl p-6 md:p-5 h-full flex justify-between overflow-hidden transition-all duration-300 ease-out bg-white md:bg-gradient-to-br md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] border border-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl md:shadow-[#0000002b] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)] md:hover:shadow-2xl md:hover:shadow-[#0000002b] hover:scale-[1.01] md:hover:scale-[1.03]">
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className="text-gray-500 md:text-[#ED8600] text-xs md:text-lg font-medium md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">Objectif annuel</p>
        <p className="text-gray-800 md:text-gray-500 text-3xl md:text-[clamp(28px,3vw,40px)] font-bold md:font-semibold tracking-tight tabular-nums">{objectif > 0 ? caActuel.toLocaleString("fr-FR") : 0} €</p>
        <p className="text-gray-400 md:text-gray-500 text-xs md:text-sm mt-1 md:mt-2">sur {objectif > 0 ? objectif.toLocaleString("fr-FR") : 0} €</p>
        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-[#ED8600]"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isCompleted && <p className="text-green-600 text-xs text-right mt-1">100% atteint ✅</p>}
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaBullseye className="h-10 w-10 sm:h-11 sm:w-11 text-[#ED8600]/80" />
      </div>
    </div>
  );
}
