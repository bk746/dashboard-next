import { FaEuroSign } from "react-icons/fa";

interface RevenueEncaisseCardProps {
  revenueEncaisse: number;
}

export default function RevenueEncaisseCard({ revenueEncaisse }: RevenueEncaisseCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Revenu encaissé</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{revenueEncaisse.toLocaleString("fr-FR")} €</p>
        <div className="flex gap-3 items-center mt-2">
          <div className="text-white text-sm">Montant total encaissé</div>
        </div>
      </div>
      <div>
        <FaEuroSign className="h-10 w-10 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
