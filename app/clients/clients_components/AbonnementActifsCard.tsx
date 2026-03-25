import { FaUserCheck } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface AbonnementActifsCardProps {
  abonnementActifs: number;
}

export default function AbonnementActifsCard({ abonnementActifs }: AbonnementActifsCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Abonnement actifs</p>
        <p className={kpiValueClass}>{abonnementActifs}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">
          Clients en Performance ou Croissance
        </p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUserCheck className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
