"use client";

import { staggerCardsGridClass } from "@/app/components/appCardStyles";
import ProspectionRelanceMiniCard from "./ProspectionRelanceMiniCard";

interface RelancesKpiCardsProps {
  prospectsEnCours: number;
  auditsAEnvoyer: number;
  relancesAFaire: number;
}

export default function RelancesKpiCards({
  prospectsEnCours,
  auditsAEnvoyer,
  relancesAFaire,
}: RelancesKpiCardsProps) {
  return (
    <div
      className={`grid ${staggerCardsGridClass} grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4`}
    >
      <ProspectionRelanceMiniCard kind="encours" value={prospectsEnCours} />
      <ProspectionRelanceMiniCard kind="audit" value={auditsAEnvoyer} />
      <ProspectionRelanceMiniCard kind="relance" value={relancesAFaire} />
    </div>
  );
}
