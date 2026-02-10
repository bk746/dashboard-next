import { FaBullseye } from "react-icons/fa";

interface ProjetsProspectCardProps {
  projetsProspect: number;
}

export default function ProjetsProspectCard({ projetsProspect }: ProjetsProspectCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-br from-balck via-black to-[#1A10AC] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-neutral-400 text-lg">Projets prospect</h3>
        <p className="text-white text-[clamp(28px,3vw,40px)] font-semibold">{projetsProspect}</p>
        <div className="flex gap-3 items-center mt-2">
          <div className="px-2 py-1 rounded-full bg-orange-600 text-white text-sm">Prospect</div>
          <div className="text-white text-sm">en attente</div>
        </div>
      </div>
      <div>
        <FaBullseye className="h-10 w-10 p-1.5 bg-transparent rounded-xl text-white" />
      </div>
    </div>
  );
}
