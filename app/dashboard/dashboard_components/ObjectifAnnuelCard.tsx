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
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-bl from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Objectif annuel</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{objectif > 0 ? caActuel.toLocaleString("fr-FR") : 0} €</p>
        <p className="text-white text-sm">
          Objectif {caActuel.toLocaleString("fr-FR")} / {objectif > 0 ? objectif.toLocaleString("fr-FR") : 0} €
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-teal-400"}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {isCompleted && (
          <p className="text-green-400 text-xs text-right mt-1">100% atteint ✅</p>
        )}
      </div>
      <div className="hidden sm:block">
        <FaBullseye className="h-10 w-10 sm:h-12 sm:w-12 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
