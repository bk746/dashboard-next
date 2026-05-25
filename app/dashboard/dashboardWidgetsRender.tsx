"use client";

import type { Objectif } from "@/app/types";
import type { DashboardWidgetId } from "@/app/lib/dashboardLayout";
import CACard from "./dashboard_components/CACard";
import ClientsActifCard from "./dashboard_components/ClientsActifCard";
import ObjectifAnnuelCard from "./dashboard_components/ObjectifAnnuelCard";
import { renderDashboardKpiGridWidget } from "./dashboard_components/dashboardKpiGridRender";

export type DashboardWidgetRenderContext = {
  caMoisEncaisse: number;
  variationCAPct: number | null;
  clientsActifs: number;
  deltaActiviteVsMoisPrec: number;
  objectifFinancier: Objectif | undefined;
  objectifAnnuelValue: number;
  montantPourObjectifFinancier: number;
  progressionObjectif: number;
  encaisseDescription: string | undefined;
  totalClients: number;
  activiteCeMoisClients: number;
  abonnementActifs: number;
  revenueEncaisseMois: number;
  hintRevenueMois: string;
  enAttenteMois: number;
  hintEnAttenteMois: string;
  enRetardMontant: number;
  depenseTotal: number;
  depenseRecurrent: number;
  depenseOccasionnel: number;
  hintDepenseMois: string;
  syntheseNette: number;
  periodLabelFinance: string;
  valeurPipeline: number;
  projetsEnCours: number;
  prochaineEcheanceStr: string | null;
  prospectsEnCours: number;
  auditsAEnvoyer: number;
  relancesAFaire: number;
  progressionObjectifsTotal: number;
};

export function renderKpiGridWidget(id: DashboardWidgetId, ctx: DashboardWidgetRenderContext) {
  const gridCard = renderDashboardKpiGridWidget(id, ctx);
  if (gridCard) return gridCard;

  switch (id) {
    case "kpiCa":
      return <CACard caMoisEncaisse={ctx.caMoisEncaisse} variationPct={ctx.variationCAPct} />;
    case "kpiClients":
      return (
        <ClientsActifCard clientsActifs={ctx.clientsActifs} deltaActiviteVsMoisPrec={ctx.deltaActiviteVsMoisPrec} />
      );
    case "kpiObjectif":
      return (
        <ObjectifAnnuelCard
          montantActuel={ctx.montantPourObjectifFinancier}
          objectif={ctx.objectifAnnuelValue}
          progression={ctx.progressionObjectif}
          objectifLibelle={ctx.objectifFinancier?.libelle}
          encaisseDescription={ctx.encaisseDescription}
        />
      );
    default:
      return null;
  }
}
