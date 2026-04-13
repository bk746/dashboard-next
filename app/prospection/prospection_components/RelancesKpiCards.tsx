"use client";

import { staggerCardsGridClass } from "@/app/components/appCardStyles";
import ProspectionRelanceMiniCard from "./ProspectionRelanceMiniCard";

interface RelancesKpiCardsProps {
  prospectsEnCours: number;
  auditsAEnvoyer: number;
  relancesMailAFaire: number;
  relancesAppelAFaire: number;
}

export default function RelancesKpiCards({
  prospectsEnCours,
  auditsAEnvoyer,
  relancesMailAFaire,
  relancesAppelAFaire,
}: RelancesKpiCardsProps) {
  return (
    <div
      className={`grid ${staggerCardsGridClass} grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-6`}
    >
      <ProspectionRelanceMiniCard kind="encours" value={prospectsEnCours} />
      <ProspectionRelanceMiniCard kind="audit" value={auditsAEnvoyer} />
      <ProspectionRelanceMiniCard kind="mail" value={relancesMailAFaire} />
      <ProspectionRelanceMiniCard kind="appel" value={relancesAppelAFaire} />
    </div>
  );
}
