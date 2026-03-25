import { FaEuroSign } from "react-icons/fa";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface ValeurTotalCardProps {
  valeurTotal: number;
  /** Libellé KPI (ex. pipeline hors projets terminés) */
  label?: string;
}

export default function ValeurTotalCard({ valeurTotal, label = "Valeur en cours" }: ValeurTotalCardProps) {
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>{label}</p>
        <p className={kpiValueClass}>{valeurTotal.toLocaleString("fr-FR")} €</p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaEuroSign className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
