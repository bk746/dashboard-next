import { FaEuroSign } from "react-icons/fa";

interface CACardProps {
  caActuel: number;
  variation: number;
}

export default function CACard({ caActuel, variation }: CACardProps) {
  const isPositive = variation >= 0;
  
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Chiffre d'affaires</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{caActuel.toLocaleString("fr-FR")} €</p>
        <div className="flex gap-3 items-center mt-2">
          <div className={`px-2 py-1 rounded-full text-white text-sm ${isPositive ? "bg-green-700" : "bg-red-700"}`}>
            {isPositive ? "+" : ""}{variation.toFixed(1)}%
          </div>
          <div className="text-white text-sm">vs mois dernier</div>
        </div>
      </div>
      <div className="hidden sm:block">
        <FaEuroSign className="h-10 w-10 sm:h-12 sm:w-12 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
