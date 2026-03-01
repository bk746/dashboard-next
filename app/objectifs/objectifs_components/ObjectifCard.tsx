import { FaBullseye } from "react-icons/fa";

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
    <div className="rounded-2xl md:rounded-xl p-6 md:p-5 h-full flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out
      bg-white md:bg-linear-to-br md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] border border-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl md:shadow-[#0000002b] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)] md:hover:shadow-2xl md:hover:shadow-[#0000002b] hover:scale-[1.01] md:hover:scale-103">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className="text-gray-500 md:text-[#ED8600] text-xs md:text-lg font-medium md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">Objectif {type}</p>
          <p className="text-gray-800 md:text-gray-500 text-3xl md:text-[clamp(28px,3vw,40px)] font-bold md:font-semibold tracking-tight tabular-nums">
            {objectif.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""}
          </p>
          <p className="text-gray-400 md:text-gray-500 text-sm">
            Actuel: {actuel.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""} / {objectif.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""}
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FaBullseye className="h-10 w-10 sm:h-11 sm:w-11 text-[#ED8600]/80" />
        </div>
      </div>

      <div className="w-full">
        <div className="w-full bg-gray-100 md:bg-gray-300 rounded-full h-2.5 md:h-3 mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 md:duration-500 ${isCompleted ? "bg-emerald-500" : "bg-[#ED8600]"}`}
            style={{ width: `${progression}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 md:text-gray-500 text-xs md:text-sm">{libelle}</p>
          <p className={`text-xs md:text-sm font-medium ${isCompleted ? "text-emerald-600" : "text-gray-500"}`}>
            {isCompleted ? "100% - Objectif réussi" : `${progression.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
