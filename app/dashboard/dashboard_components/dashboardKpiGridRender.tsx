"use client";

import type { ReactNode } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaEuroSign,
  FaWallet,
  FaBalanceScale,
  FaBullseye,
  FaCalendarAlt,
} from "react-icons/fa";
import { Bell, FileText, Target } from "lucide-react";
import type { DashboardWidgetId } from "@/app/lib/dashboardLayout";
import type { DashboardWidgetRenderContext } from "../dashboardWidgetsRender";
import DashboardToneKpiCard, { DashboardToneBadge } from "./DashboardToneKpiCard";

function BadgeRow({ badge, hint }: { badge: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badge}
      {hint ? <span className="text-xs text-zinc-400">{hint}</span> : null}
    </div>
  );
}

export function renderDashboardKpiGridWidget(id: DashboardWidgetId, ctx: DashboardWidgetRenderContext) {
  switch (id) {
    case "cardTotalClients":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Total clients"
          subtitle="Depuis toujours"
          value={ctx.totalClients}
          icon={<FaUsers aria-hidden />}
        />
      );

    case "cardActiviteMois":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Activité ce mois"
          subtitle="Dernière activité datée ce mois-ci"
          value={ctx.activiteCeMoisClients}
          icon={<FaUserPlus aria-hidden />}
        />
      );

    case "cardAbonnementsActifs":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Abonnement actifs"
          subtitle="Clients en Performance ou Croissance"
          value={ctx.abonnementActifs}
          icon={<FaUserCheck aria-hidden />}
        />
      );

    case "cardRevenueEncaisse":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="Revenu encaissé"
          subtitle={ctx.hintRevenueMois}
          value={`${ctx.revenueEncaisseMois.toLocaleString("fr-FR")} €`}
          icon={<FaEuroSign aria-hidden />}
        />
      );

    case "cardEnAttente":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="En attente"
          subtitle={ctx.hintEnAttenteMois}
          value={`${ctx.enAttenteMois.toLocaleString("fr-FR")} €`}
          icon={<FaUsers aria-hidden />}
          footer={
            <BadgeRow badge={<DashboardToneBadge variant="warn">Non payé</DashboardToneBadge>} hint="factures" />
          }
        />
      );

    case "cardEnRetard":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="En retard"
          subtitle="Factures impayées, date avant aujourd'hui"
          value={`${ctx.enRetardMontant.toLocaleString("fr-FR")} €`}
          icon={<FaBullseye aria-hidden />}
          footer={
            <BadgeRow badge={<DashboardToneBadge variant="warn">Impayé</DashboardToneBadge>} hint="à relancer" />
          }
        />
      );

    case "cardDepenses":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="Dépenses"
          subtitle={ctx.hintDepenseMois}
          value={`${ctx.depenseTotal.toLocaleString("fr-FR")} €`}
          icon={<FaWallet aria-hidden />}
          footer={
            <div className="flex flex-col gap-1.5 text-xs text-zinc-500">
              {ctx.depenseRecurrent > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardToneBadge>Récurrent / mois</DashboardToneBadge>
                  <span>{ctx.depenseRecurrent.toLocaleString("fr-FR")} €</span>
                </div>
              ) : null}
              {ctx.depenseOccasionnel > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardToneBadge>Occasionnel</DashboardToneBadge>
                  <span>{ctx.depenseOccasionnel.toLocaleString("fr-FR")} €</span>
                </div>
              ) : null}
            </div>
          }
        />
      );

    case "cardSyntheseNette": {
      const positive = ctx.syntheseNette >= 0;
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="Synthèse nette"
          subtitle={`Encaissé − dépenses (${ctx.periodLabelFinance})`}
          value={`${ctx.syntheseNette.toLocaleString("fr-FR")} €`}
          valueClassName={`text-[28px] font-semibold tabular-nums tracking-tight md:text-[32px] md:leading-[1.05] ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
          icon={<FaBalanceScale aria-hidden />}
        />
      );
    }

    case "cardValeurPipeline":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="Valeur en cours"
          subtitle="Pipeline hors projets terminés"
          value={`${ctx.valeurPipeline.toLocaleString("fr-FR")} €`}
          icon={<FaEuroSign aria-hidden />}
        />
      );

    case "cardProjetsEnCours":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Projets en cours"
          value={ctx.projetsEnCours}
          icon={<FaUsers aria-hidden />}
          footer={
            <BadgeRow badge={<DashboardToneBadge variant="success">Pipeline</DashboardToneBadge>} hint="hors terminés" />
          }
        />
      );

    case "cardProchaineEcheance":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Prochaine échéance"
          value={ctx.prochaineEcheanceStr ?? "Aucune"}
          valueClassName="text-2xl font-semibold tracking-tight text-zinc-900 md:text-[28px]"
          icon={<FaCalendarAlt aria-hidden />}
          footer={
            <BadgeRow
              badge={<DashboardToneBadge variant="success">Date fin</DashboardToneBadge>}
              hint={ctx.prochaineEcheanceStr ? "la plus proche" : "aucun projet à venir"}
            />
          }
        />
      );

    case "cardProspectsEnCours":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Prospects en cours"
          subtitle="Réponse en attente"
          value={ctx.prospectsEnCours}
          icon={<FaUsers aria-hidden />}
        />
      );

    case "cardAuditProspection":
      return (
        <DashboardToneKpiCard
          tone="blue"
          label="Audit à faire"
          subtitle="Pas encore réalisé"
          value={ctx.auditsAEnvoyer}
          icon={<FileText strokeWidth={1.75} aria-hidden />}
        />
      );

    case "cardRelanceProspection":
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="À relancer"
          subtitle="Échéance atteinte"
          value={ctx.relancesAFaire}
          icon={<Bell strokeWidth={1.75} aria-hidden />}
        />
      );

    case "cardProgressionObjectifs": {
      const pct = Math.min(ctx.progressionObjectifsTotal, 100);
      const done = pct >= 100;
      return (
        <DashboardToneKpiCard
          tone="pink"
          label="Progression totale"
          subtitle="Tous les objectifs confondus"
          value={`${pct.toFixed(1)}%`}
          icon={<Target strokeWidth={1.75} aria-hidden />}
          footer={
            <div>
              <div className="mb-2 flex justify-between text-[11px] font-medium text-zinc-400">
                <span>Avancement</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {done ? <p className="mt-1.5 text-right text-xs font-medium text-emerald-600">Objectif réussi</p> : null}
            </div>
          }
        />
      );
    }

    default:
      return null;
  }
}
