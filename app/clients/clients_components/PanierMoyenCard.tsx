import { FaShoppingCart } from "react-icons/fa";

interface PanierMoyenCardProps {
  panierMoyen: number;
}

export default function PanierMoyenCard({ panierMoyen }: PanierMoyenCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Panier moyen</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{panierMoyen.toLocaleString("fr-FR")} €</p>
        <div className="flex gap-3 items-center mt-2">
          <div className="text-white text-sm">Moyenne des CA totaux</div>
        </div>
      </div>
      <div className="hidden sm:block">
        <FaShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
