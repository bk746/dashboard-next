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
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex flex-col justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-neutral-400 text-lg">Objectif {type}</h3>
          <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">
            {objectif.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""}
          </p>
          <p className="text-white text-sm">
            Actuel: {actuel.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""} / {objectif.toLocaleString("fr-FR")} {type === "Financier" ? "€" : ""}
          </p>
        </div>
        <div>
          <FaBullseye className="h-10 w-10 p-1.5 bg-transparent rounded-xl text-white" />
        </div>
      </div>
      
      <div className="w-full">
        <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isCompleted ? "bg-green-500" : "bg-teal-400"
            }`}
            style={{ width: `${progression}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-neutral-400 text-sm">{libelle}</p>
          <p className={`text-sm font-medium ${isCompleted ? "text-green-400" : "text-white"}`}>
            {isCompleted ? "100% - Objectif réussi ✅" : `${progression.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
