import { FaEuroSign } from "react-icons/fa";
import { appCardKpi, kpiLabelSuccessClass, kpiValueClass, kpiIconSuccessClass } from "@/app/components/appCardStyles";

interface RevenueEncaisseCardProps {
  revenueEncaisse: number;
  periodHint: string;
}

export default function RevenueEncaisseCard({ revenueEncaisse, periodHint }: RevenueEncaisseCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelSuccessClass}>Revenu encaissé</p>
        <p className={kpiValueClass}>{revenueEncaisse.toLocaleString("fr-FR")} €</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">{periodHint}</p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaEuroSign className={kpiIconSuccessClass} aria-hidden />
      </div>
    </div>
  );
}
