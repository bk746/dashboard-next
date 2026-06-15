"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Devis } from "@/app/types";
import type { ProspectRdvPlanningRow } from "@/app/prospection/prospection_utils";
import type { DashboardWidgetId } from "@/app/lib/dashboardLayout";
import EvolutionCACard from "./dashboard_components/EvolutionCACard";
import NouveauxClientsCard from "./dashboard_components/NouveauxClientsCard";
import ObjectifsSemaineCard, { type ObjectifSemaineItem } from "./dashboard_components/ObjectifsSemaineCard";
import DashboardQuickLinks from "./dashboard_components/DashboardQuickLinks";
import DevisKpiStrip from "@/app/finance/finance_components/DevisKpiStrip";
import RendezVousAVenirCard from "@/app/prospection/prospection_components/RendezVousAVenirCard";
import { renderKpiGridWidget, type DashboardWidgetRenderContext } from "./dashboardWidgetsRender";

export type DashboardWidgetExtraContext = {
  evolutionCAData: { month: string; revenue: number }[];
  activiteClientsData: { month: string; clients: number }[];
  objectifsSemaine: ObjectifSemaineItem[];
  weekLabel: string;
  rendezVousAVenir: ProspectRdvPlanningRow[];
  devis: Devis[];
  router: AppRouterInstance;
};

export function renderDashboardWidget(
  id: DashboardWidgetId,
  ctx: DashboardWidgetRenderContext,
  extra: DashboardWidgetExtraContext
) {
  switch (id) {
    case "quickLinks":
      return <DashboardQuickLinks />;
    case "chartEvolutionCa":
      return <EvolutionCACard data={extra.evolutionCAData} />;
    case "chartActiviteClients":
      return (
        <div className="flex h-full min-h-[340px] flex-col">
          <div className="mb-3 shrink-0">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Activité clients</h2>
            <p className="text-xs text-zinc-500">12 mois glissants</p>
          </div>
          <div className="min-h-0 flex-1">
            <NouveauxClientsCard data={extra.activiteClientsData} />
          </div>
        </div>
      );
    case "kpiObjectif":
      return renderKpiGridWidget(id, ctx);
    case "cardObjectifsSemaine":
      return <ObjectifsSemaineCard items={extra.objectifsSemaine} weekLabel={extra.weekLabel} />;
    case "cardRdvProspection":
      return (
        <div className="flex h-full flex-col">
          <RendezVousAVenirCard
            items={extra.rendezVousAVenir}
            onOpenProspect={() => {
              extra.router.push("/prospection");
            }}
          />
        </div>
      );
    case "devisKpiStrip":
      return (
        <div className="flex h-full flex-col">
          <div className="mb-3 shrink-0">
            <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">Vue d&apos;ensemble devis</h2>
            <p className="text-xs text-zinc-400">Signés, pipeline et refus</p>
          </div>
          <DevisKpiStrip devis={extra.devis} embedded />
        </div>
      );
    default:
      return renderKpiGridWidget(id, ctx);
  }
}
