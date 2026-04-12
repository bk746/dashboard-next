"use client";

import type { Objectif } from "@/app/types";
import type { DashboardWidgetId } from "@/app/lib/dashboardLayout";
import TotalClientCard from "@/app/clients/clients_components/TotalClientCard";
import NouveauClientCard from "@/app/clients/clients_components/NouveauClientCard";
import AbonnementActifsCard from "@/app/clients/clients_components/AbonnementActifsCard";
import RevenueEncaisseCard from "@/app/finance/finance_components/RevenueEncaisseCard";
import EnAttenteCard from "@/app/finance/finance_components/EnAttenteCard";
import EnRetardCard from "@/app/finance/finance_components/EnRetardCard";
import DepenseCard from "@/app/finance/finance_components/DepenseCard";
import SyntheseNetCard from "@/app/finance/finance_components/SyntheseNetCard";
import ValeurTotalCard from "@/app/deals-projets/deals_projets_components/ValeurTotalCard";
import ProjetsActifsCard from "@/app/deals-projets/deals_projets_components/ProjetsActifsCard";
import ProchaineEcheanceCard from "@/app/deals-projets/deals_projets_components/ProchaineEcheanceCard";
import ProspectionRelanceMiniCard from "@/app/prospection/prospection_components/ProspectionRelanceMiniCard";
import ProgressionTotalCard from "@/app/objectifs/objectifs_components/ProgressionTotalCard";
import CACard from "./dashboard_components/CACard";
import ClientsActifCard from "./dashboard_components/ClientsActifCard";
import ObjectifAnnuelCard from "./dashboard_components/ObjectifAnnuelCard";

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
  auditsAEnvoyer: number;
  relancesMailAFaire: number;
  relancesAppelAFaire: number;
  progressionObjectifsTotal: number;
};

export function renderKpiGridWidget(id: DashboardWidgetId, ctx: DashboardWidgetRenderContext) {
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
    case "cardTotalClients":
      return <TotalClientCard totalClients={ctx.totalClients} />;
    case "cardActiviteMois":
      return <NouveauClientCard activiteCeMois={ctx.activiteCeMoisClients} />;
    case "cardAbonnementsActifs":
      return <AbonnementActifsCard abonnementActifs={ctx.abonnementActifs} />;
    case "cardRevenueEncaisse":
      return <RevenueEncaisseCard revenueEncaisse={ctx.revenueEncaisseMois} periodHint={ctx.hintRevenueMois} />;
    case "cardEnAttente":
      return <EnAttenteCard enAttente={ctx.enAttenteMois} periodHint={ctx.hintEnAttenteMois} />;
    case "cardEnRetard":
      return <EnRetardCard enRetard={ctx.enRetardMontant} />;
    case "cardDepenses":
      return (
        <DepenseCard
          total={ctx.depenseTotal}
          totalRecurrent={ctx.depenseRecurrent}
          totalOccasionnel={ctx.depenseOccasionnel}
          periodHint={ctx.hintDepenseMois}
        />
      );
    case "cardSyntheseNette":
      return <SyntheseNetCard net={ctx.syntheseNette} periodLabel={ctx.periodLabelFinance} />;
    case "cardValeurPipeline":
      return <ValeurTotalCard valeurTotal={ctx.valeurPipeline} />;
    case "cardProjetsEnCours":
      return <ProjetsActifsCard projetsEnCours={ctx.projetsEnCours} />;
    case "cardProchaineEcheance":
      return <ProchaineEcheanceCard prochaineEcheance={ctx.prochaineEcheanceStr} />;
    case "cardAuditProspection":
      return <ProspectionRelanceMiniCard kind="audit" value={ctx.auditsAEnvoyer} />;
    case "cardRelanceMailProspection":
      return <ProspectionRelanceMiniCard kind="mail" value={ctx.relancesMailAFaire} />;
    case "cardRelanceAppelProspection":
      return <ProspectionRelanceMiniCard kind="appel" value={ctx.relancesAppelAFaire} />;
    case "cardProgressionObjectifs":
      return <ProgressionTotalCard progressionTotal={ctx.progressionObjectifsTotal} />;
    default:
      return null;
  }
}
