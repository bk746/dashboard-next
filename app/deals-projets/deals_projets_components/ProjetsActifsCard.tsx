import { FaUsers } from "react-icons/fa";

interface ProjetsActifsCardProps {
  projetsActifs: number;
}

export default function ProjetsActifsCard({ projetsActifs }: ProjetsActifsCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Projets actifs</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{projetsActifs}</p>
        <div className="flex gap-3 items-center mt-2">
          <div className="px-2 py-1 rounded-full bg-green-700 text-white text-sm">Actifs</div>
          <div className="text-white text-sm">en cours</div>
        </div>
      </div>
      <div>
        <FaUsers className="h-10 w-10 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
