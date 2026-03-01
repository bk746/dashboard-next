import { FaUsers } from "react-icons/fa";

interface ClientsActifCardProps {
  clientsActifs: number;
  variation: number;
}

export default function ClientsActifCard({ clientsActifs, variation }: ClientsActifCardProps) {
  const isPositive = variation >= 0;
  
  return (
    <div className="border border-neutral-300 rounded-xl p-5 bg-linear-to-b from-[#f6f6f6] shadow-2xl shadow-[#0000002b] to-[#ED8600] h-full flex justify-between hover:scale-103 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[#ED8600] text-lg font-bold">Clients actifs</h3>
        <p className="text-gray-500 text-[clamp(28px,3vw,40px)] font-semibold">{clientsActifs}</p>
        <div className="flex gap-3 items-center mt-2">
          <div className={`px-2 py-1 rounded-full text-white text-sm ${isPositive ? "bg-green-700" : "bg-red-700"}`}>
            {isPositive ? "+" : ""}{variation} client{variation > 1 || variation < -1 ? "s" : ""}
          </div>
          <div className="text-gray-500 text-sm">vs mois dernier</div>
        </div>
      </div>
      <div className="hidden sm:block">
        <FaUsers className="h-10 w-10 sm:h-12 sm:w-12 p-1.5 bg-transparent rounded-xl text-[#ED8600]" />
      </div>
    </div>
  );
}
