import { FaChartLine } from "react-icons/fa";
import {
  appCardKpi,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  badgePositiveClass,
  badgeNegativeClass,
} from "@/app/components/appCardStyles";

interface BeneficeNetCardProps {
  beneficeNet: number;
}

export default function BeneficeNetCard({ beneficeNet }: BeneficeNetCardProps) {
  const isPositive = beneficeNet >= 0;

  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Bénéfice net</p>
        <p className={kpiValueClass}>{beneficeNet.toLocaleString("fr-FR")} €</p>
        <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-2">
          <span className={isPositive ? badgePositiveClass : badgeNegativeClass}>
            {isPositive ? "+" : ""}
            {beneficeNet.toLocaleString("fr-FR")} €
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">bénéfice net</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaChartLine className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
