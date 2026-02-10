import { FaUsers } from "react-icons/fa";

interface EnAttenteCardProps {
  enAttente: number;
}

export default function EnAttenteCard({ enAttente }: EnAttenteCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-amber-500 h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">En attente</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{enAttente.toLocaleString("fr-FR")} €</p>
        <div className="flex gap-3 items-center mt-2">
          <div className="px-2 py-1 rounded-full bg-yellow-600 text-white text-sm">En attente</div>
          <div className="text-white text-sm">de paiement</div>
        </div>
      </div>
      <div>
        <FaUsers className="h-10 w-10 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
