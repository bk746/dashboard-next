import { FaUsers } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface TotalClientCardProps {
  totalClients: number;
}

export default function TotalClientCard({ totalClients }: TotalClientCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Total clients</p>
        <p className={kpiValueClass}>{totalClients}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">Depuis toujours</p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUsers className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
