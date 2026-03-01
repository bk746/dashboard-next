import { FaUsers } from "react-icons/fa";

interface ClientsActifCardProps {
  clientsActifs: number;
  variation: number;
}

export default function ClientsActifCard({ clientsActifs, variation }: ClientsActifCardProps) {
  const isPositive = variation >= 0;

  return (
    <div className="h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">Clients actifs</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
            {clientsActifs}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {isPositive ? "+" : ""}
              {variation} client{variation !== 1 && variation !== -1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-400">vs mois dernier</span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <FaUsers className="h-5 w-5 text-orange-500" />
        </div>
      </div>
    </div>
  );
}
