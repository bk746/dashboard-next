"use client";

import { useMemo, Fragment, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Facture, Client, Objectif, Devis, Depense, Projet, Prospect } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { isDateInMonth } from "@/app/finance/utils";
import {
  filterFacturesByPeriod,
  computeDepenseTotals,
  isFactureEnRetard,
  getResteAPayerFacture,
  getMontantEncaisseFacture,
} from "@/app/finance/utils";
import { countAbonnementPremiumClients } from "@/lib/abonnement";
import {
  defaultDashboardLayoutPrefs,
  normalizeDashboardLayoutPrefs,
  isTopWidgetId,
  isHeroWidgetId,
  isChartWidgetId,
  isKpiGridWidgetId,
  isFullWidthWidgetId,
  type DashboardLayoutPrefs,
  type DashboardWidgetId,
} from "@/app/lib/dashboardLayout";
import { getActuelPourObjectif, normalizeObjectifPeriode, getFinancierEncaisseLabel } from "@/app/lib/objectifsPeriod";
import {
  auditPasEncoreEnvoye,
  besoinRelance,
  listeRendezVousAVenir,
  migrateProspect,
  prospectEnCours,
} from "@/app/prospection/prospection_utils";
import DevisKpiStrip from "@/app/finance/finance_components/DevisKpiStrip";
import RendezVousAVenirCard from "@/app/prospection/prospection_components/RendezVousAVenirCard";
import { staggerCardsGridClass } from "@/app/components/appCardStyles";

const dashboardShellClass =
  "min-h-screen w-full bg-[#F5F5F7] text-zinc-900 p-3 sm:p-4 md:p-8 md:px-10 lg:px-12 [&_.motion-card]:!rounded-2xl [&_.motion-card]:!border-0 [&_.motion-card]:!ring-1 [&_.motion-card]:!ring-black/[0.05] [&_.motion-card]:!shadow-[0_1px_2px_rgba(0,0,0,0.03)]";
import { Sparkles, Settings } from "lucide-react";
import EvolutionCACard from "./dashboard_components/EvolutionCACard";
import CACard from "./dashboard_components/CACard";
import ClientsActifCard from "./dashboard_components/ClientsActifCard";
import ObjectifAnnuelCard from "./dashboard_components/ObjectifAnnuelCard";
import NouveauxClientsCard from "./dashboard_components/NouveauxClientsCard";
import DashboardQuickLinks from "./dashboard_components/DashboardQuickLinks";
import { renderKpiGridWidget, type DashboardWidgetRenderContext } from "./dashboardWidgetsRender";

function countActifsWithActiviteInMonth(clients: Client[], year: number, month: number): number {
  return clients.filter((c) => {
    if (c.statut !== "Actif") return false;
    return isDateInMonth(c.derniereActivite, year, month);
  }).length;
}

function computeProchaineEcheance(projets: Projet[]): string | null {
  const projetsPipeline = projets.filter((p) => p.statut !== "Terminé");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const projetsAvecDateFin = projetsPipeline
    .filter((p) => p.dateFin && p.dateFin.trim() !== "")
    .map((p) => {
      const parts = p.dateFin.trim().split("/");
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      const dateFin = new Date(year, month, day);
      return { dateFin, dateFinStr: p.dateFin };
    })
    .filter((x): x is { dateFin: Date; dateFinStr: string } => x !== null && !isNaN(x.dateFin.getTime()));
  const echeancesFutures = projetsAvecDateFin
    .filter(({ dateFin }) => dateFin >= today)
    .sort((a, b) => a.dateFin.getTime() - b.dateFin.getTime());
  return echeancesFutures.length > 0 ? echeancesFutures[0].dateFinStr : null;
}

export default function Dashboard() {
  const router = useRouter();
  const [factures] = useJsonBucket<Facture[]>("factures", []);
  const [clients] = useJsonBucket<Client[]>("clients", []);
  const [objectifs] = useJsonBucket<Objectif[]>("objectifs", []);
  const [devis] = useJsonBucket<Devis[]>("devis", []);
  const [depenses] = useJsonBucket<Depense[]>("depenses", []);
  const [projets] = useJsonBucket<Projet[]>("projets", []);
  const [prospects] = useJsonBucket<Prospect[]>("prospection", []);
  const [layoutRaw, setLayoutRaw] = useJsonBucket<DashboardLayoutPrefs>(
    "dashboardLayout",
    defaultDashboardLayoutPrefs()
  );

  const prefs = useMemo(() => normalizeDashboardLayoutPrefs(layoutRaw), [layoutRaw]);

  useEffect(() => {
    const normalized = normalizeDashboardLayoutPrefs(layoutRaw);
    const rawVersion = layoutRaw.layoutVersion ?? 1;
    const nextVersion = normalized.layoutVersion ?? 1;
    if (rawVersion < nextVersion) {
      setLayoutRaw(normalized);
    }
  }, [layoutRaw, setLayoutRaw]);
  const visibleOrder = useMemo(
    () => prefs.order.filter((id) => !prefs.hidden.includes(id)),
    [prefs]
  );

  const currentDate = useMemo(() => new Date(), []);
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  const caMoisEncaisse = useMemo(
    () =>
      factures
        .filter((f) => isDateInMonth(f.date, y, m))
        .reduce((sum, f) => sum + getMontantEncaisseFacture(f), 0),
    [factures, y, m]
  );

  const prevMonthDate = useMemo(() => new Date(y, m - 1, 1), [y, m]);
  const py = prevMonthDate.getFullYear();
  const pm = prevMonthDate.getMonth();

  const caMoisPrecedent = useMemo(
    () =>
      factures
        .filter((f) => isDateInMonth(f.date, py, pm))
        .reduce((sum, f) => sum + getMontantEncaisseFacture(f), 0),
    [factures, py, pm]
  );

  const variationCAPct = useMemo(() => {
    if (caMoisPrecedent <= 0) return null;
    return ((caMoisEncaisse - caMoisPrecedent) / caMoisPrecedent) * 100;
  }, [caMoisEncaisse, caMoisPrecedent]);

  const clientsActifs = useMemo(() => clients.filter((c) => c.statut === "Actif").length, [clients]);

  const activiteActifsCeMois = useMemo(() => countActifsWithActiviteInMonth(clients, y, m), [clients, y, m]);

  const activiteActifsMoisPrec = useMemo(() => countActifsWithActiviteInMonth(clients, py, pm), [clients, py, pm]);

  const deltaActiviteVsMoisPrec = activiteActifsCeMois - activiteActifsMoisPrec;

  const objectifFinancier = useMemo(() => objectifs.find((o) => o.type === "Financier"), [objectifs]);

  const objectifAnnuelValue = objectifFinancier?.objectif ?? 0;

  const montantPourObjectifFinancier = useMemo(() => {
    if (!objectifFinancier) return 0;
    return getActuelPourObjectif(objectifFinancier, factures, clients, currentDate);
  }, [objectifFinancier, factures, clients, currentDate]);

  const progressionObjectif =
    objectifAnnuelValue > 0 ? (montantPourObjectifFinancier / objectifAnnuelValue) * 100 : 0;

  const periodeFin = normalizeObjectifPeriode(objectifFinancier?.periode);
  const encaisseDescription = objectifFinancier ? getFinancierEncaisseLabel(periodeFin) : undefined;

  const facturesMois = useMemo(() => filterFacturesByPeriod(factures, "month"), [factures]);

  const revenueEncaisseMois = useMemo(
    () => facturesMois.reduce((s, f) => s + getMontantEncaisseFacture(f), 0),
    [facturesMois]
  );

  const enAttenteMois = useMemo(
    () => facturesMois.filter((f) => f.statut === "Non payé").reduce((s, f) => s + getResteAPayerFacture(f), 0),
    [facturesMois]
  );

  const enRetardMontant = useMemo(
    () => factures.filter((f) => isFactureEnRetard(f)).reduce((s, f) => s + getResteAPayerFacture(f), 0),
    [factures]
  );

  const depenseTotals = useMemo(() => computeDepenseTotals(depenses, "month"), [depenses]);

  const syntheseNette = revenueEncaisseMois - depenseTotals.total;

  const totalClients = clients.length;

  const activiteCeMoisClients = useMemo(() => {
    return clients.filter((client) => {
      try {
        const clientDate = new Date(client.derniereActivite.split("/").reverse().join("-"));
        return (
          !isNaN(clientDate.getTime()) && clientDate.getMonth() === m && clientDate.getFullYear() === y
        );
      } catch {
        return false;
      }
    }).length;
  }, [clients, m, y]);

  const abonnementActifs = useMemo(() => countAbonnementPremiumClients(clients), [clients]);

  const projetsPipeline = useMemo(() => projets.filter((p) => p.statut !== "Terminé"), [projets]);
  const valeurPipeline = useMemo(() => projetsPipeline.reduce((sum, p) => sum + p.valeur, 0), [projetsPipeline]);
  const projetsEnCours = projetsPipeline.length;
  const prochaineEcheanceStr = useMemo(() => computeProchaineEcheance(projets), [projets]);

  const prospectsM = useMemo(() => prospects.map(migrateProspect), [prospects]);

  const { prospectsEnCours, auditsAEnvoyer, relancesAFaire, rendezVousAVenir } = useMemo(() => {
    return {
      prospectsEnCours: prospectsM.filter((p) => prospectEnCours(p)).length,
      auditsAEnvoyer: prospectsM.filter((p) => auditPasEncoreEnvoye(p)).length,
      relancesAFaire: prospectsM.filter((p) => besoinRelance(p)).length,
      rendezVousAVenir: listeRendezVousAVenir(prospectsM),
    };
  }, [prospectsM]);

  const progressionObjectifsTotal = useMemo(() => {
    const progressions = objectifs.map((obj) => {
      const actuel = getActuelPourObjectif(obj, factures, clients, currentDate);
      return obj.objectif > 0 ? Math.min((actuel / obj.objectif) * 100, 100) : 0;
    });
    return progressions.length > 0 ? progressions.reduce((a, b) => a + b, 0) / progressions.length : 0;
  }, [objectifs, factures, clients, currentDate]);

  const evolutionCAData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i) + 1, 0);
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

      const revenue = factures
        .filter((f) => {
          try {
            const factureDate = new Date(f.date.split("/").reverse().join("-"));
            return factureDate >= monthDate && factureDate <= monthEnd;
          } catch {
            return false;
          }
        })
        .reduce((sum, facture) => sum + getMontantEncaisseFacture(facture), 0);

      return {
        month: monthNames[monthDate.getMonth()],
        revenue: revenue || 0,
      };
    });
  }, [factures, currentDate]);

  const activiteClientsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i) + 1, 0);
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

      const count = clients.filter((c) => {
        try {
          const clientDate = new Date(c.derniereActivite.split("/").reverse().join("-"));
          return clientDate >= monthDate && clientDate <= monthEnd;
        } catch {
          return false;
        }
      }).length;

      return {
        month: monthNames[monthDate.getMonth()],
        clients: count || 0,
      };
    });
  }, [clients, currentDate]);

  const widgetCtx: DashboardWidgetRenderContext = useMemo(
    () => ({
      caMoisEncaisse,
      variationCAPct,
      clientsActifs,
      deltaActiviteVsMoisPrec,
      objectifFinancier,
      objectifAnnuelValue,
      montantPourObjectifFinancier,
      progressionObjectif,
      encaisseDescription,
      totalClients,
      activiteCeMoisClients,
      abonnementActifs,
      revenueEncaisseMois,
      hintRevenueMois: "Payé intégral + acomptes (date de facture, mois en cours)",
      enAttenteMois,
      hintEnAttenteMois: "Factures impayées — émises ce mois",
      enRetardMontant,
      depenseTotal: depenseTotals.total,
      depenseRecurrent: depenseTotals.totalRecurrent,
      depenseOccasionnel: depenseTotals.totalOccasionnel,
      hintDepenseMois:
        "Récurrents (mois) + occasionnels datés ce mois",
      syntheseNette,
      periodLabelFinance: "Mois en cours",
      valeurPipeline,
      projetsEnCours,
      prochaineEcheanceStr,
      prospectsEnCours,
      auditsAEnvoyer,
      relancesAFaire,
      progressionObjectifsTotal,
    }),
    [
      caMoisEncaisse,
      variationCAPct,
      clientsActifs,
      deltaActiviteVsMoisPrec,
      objectifFinancier,
      objectifAnnuelValue,
      montantPourObjectifFinancier,
      progressionObjectif,
      encaisseDescription,
      totalClients,
      activiteCeMoisClients,
      abonnementActifs,
      revenueEncaisseMois,
      enAttenteMois,
      enRetardMontant,
      depenseTotals.total,
      depenseTotals.totalRecurrent,
      depenseTotals.totalOccasionnel,
      syntheseNette,
      valeurPipeline,
      projetsEnCours,
      prochaineEcheanceStr,
      prospectsEnCours,
      auditsAEnvoyer,
      relancesAFaire,
      progressionObjectifsTotal,
    ]
  );

  const hasNoData = factures.length === 0 && clients.length === 0;

  const effectiveOrder = useMemo(() => {
    if (!hasNoData) return visibleOrder;
    return visibleOrder.filter((id) => id === "quickLinks" || id === "kpiObjectif");
  }, [hasNoData, visibleOrder]);

  const blocks = useMemo(() => {
    const out: React.ReactNode[] = [];
    let i = 0;
    const order = effectiveOrder;
    const visibleSet = new Set(order);
    const showHeroEv = visibleSet.has("chartEvolutionCa");
    const showHeroCa = visibleSet.has("kpiCa");
    const showHeroClients = visibleSet.has("kpiClients");

    if (showHeroEv || showHeroCa || showHeroClients) {
      const hasSideKpis = showHeroCa || showHeroClients;
      out.push(
        <section
          key="hero-overview"
          className="mb-6 px-4 sm:px-6 md:mb-8 md:px-0"
          aria-label="Vue principale — évolution du CA"
        >
          <div
            className={`grid grid-cols-1 gap-4 sm:gap-6 ${
              showHeroEv && hasSideKpis ? "lg:grid-cols-3" : hasSideKpis ? "sm:grid-cols-2" : ""
            }`}
          >
            {showHeroEv ? (
              <div
                className={
                  hasSideKpis
                    ? "min-h-[360px] sm:min-h-[400px] lg:col-span-2 lg:min-h-[420px]"
                    : "min-h-[360px] sm:min-h-[400px]"
                }
              >
                <EvolutionCACard data={evolutionCAData} />
              </div>
            ) : null}
            {hasSideKpis ? (
              <div
                className={`flex flex-col gap-4 sm:gap-6 ${
                  showHeroEv ? "" : "sm:col-span-2 lg:col-span-3 sm:grid sm:grid-cols-2"
                }`}
              >
                {showHeroCa ? (
                  <CACard caMoisEncaisse={widgetCtx.caMoisEncaisse} variationPct={widgetCtx.variationCAPct} />
                ) : null}
                {showHeroClients ? (
                  <ClientsActifCard
                    clientsActifs={widgetCtx.clientsActifs}
                    deltaActiviteVsMoisPrec={widgetCtx.deltaActiviteVsMoisPrec}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    while (i < order.length) {
      const id = order[i];

      if (isHeroWidgetId(id)) {
        i++;
        continue;
      }

      if (isTopWidgetId(id)) {
        const batch: DashboardWidgetId[] = [];
        while (i < order.length && isTopWidgetId(order[i])) {
          batch.push(order[i]);
          i++;
        }
        out.push(
          <div key={`top-${out.length}`} className="mb-6 space-y-4 px-4 sm:px-6 md:px-0">
            {batch.map((wid) => (
              <Fragment key={wid}>
                {wid === "quickLinks" ? <DashboardQuickLinks /> : null}
                {wid === "kpiObjectif" ? (
                  <ObjectifAnnuelCard
                    montantActuel={widgetCtx.montantPourObjectifFinancier}
                    objectif={widgetCtx.objectifAnnuelValue}
                    progression={widgetCtx.progressionObjectif}
                    objectifLibelle={widgetCtx.objectifFinancier?.libelle}
                    encaisseDescription={widgetCtx.encaisseDescription}
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        );
        continue;
      }

      if (isChartWidgetId(id)) {
        const batch: DashboardWidgetId[] = [];
        while (i < order.length && isChartWidgetId(order[i])) {
          batch.push(order[i]);
          i++;
        }
        const chartBatch = batch.filter((wid) => wid !== "chartEvolutionCa");
        if (chartBatch.length === 0) continue;

        const hasAc = chartBatch.includes("chartActiviteClients");
        out.push(
          <section key={`charts-${out.length}`} className="px-4 sm:px-6 md:px-0 mb-8" aria-labelledby="dash-charts-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="block h-5 w-1 rounded-full bg-gradient-to-b from-sky-500 to-sky-500/30" aria-hidden />
                <div>
                  <h2 id="dash-charts-heading" className="text-base font-semibold tracking-tight text-zinc-900">
                    Activité clients
                  </h2>
                  <p className="text-xs text-zinc-500">Dernière activité par mois, 12 mois glissants.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-6">
              {hasAc ? (
                <div className="min-h-[380px] sm:min-h-[440px]">
                  <NouveauxClientsCard data={activiteClientsData} />
                </div>
              ) : null}
            </div>
          </section>
        );
        continue;
      }

      if (isFullWidthWidgetId(id)) {
        if (id === "cardRdvProspection") {
          out.push(
            <section key={`rdv-${out.length}`} className="px-4 sm:px-6 md:px-0 mb-8" aria-label="Rendez-vous prospection">
              <RendezVousAVenirCard
                items={rendezVousAVenir}
                onOpenProspect={() => {
                  router.push("/prospection");
                }}
              />
            </section>
          );
          i++;
          continue;
        }
        if (id === "devisKpiStrip") {
          out.push(
            <section key={`devis-${out.length}`} className="px-4 sm:px-6 md:px-0 mb-8" aria-labelledby="dash-devis-kpi">
              <div className="mb-4">
                <h2 id="dash-devis-kpi" className="text-[17px] font-semibold tracking-tight text-zinc-900">
                  Vue d&apos;ensemble devis
                </h2>
                <p className="text-xs text-zinc-400">
                  Signés, pipeline (brouillon + envoyé) et refus — mêmes indicateurs que dans Finance.
                </p>
              </div>
              <DevisKpiStrip devis={devis} embedded />
            </section>
          );
          i++;
          continue;
        }
        i++;
        continue;
      }

      if (isKpiGridWidgetId(id)) {
        const batch: DashboardWidgetId[] = [];
        while (i < order.length && isKpiGridWidgetId(order[i])) {
          batch.push(order[i]);
          i++;
        }
        out.push(
          <section
            key={`kpi-grid-${out.length}`}
            className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8"
            aria-label="Indicateurs"
          >
            <div
              className={`grid ${staggerCardsGridClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6`}
            >
              {batch.map((bid) => (
                <Fragment key={bid}>{renderKpiGridWidget(bid, widgetCtx)}</Fragment>
              ))}
            </div>
          </section>
        );
        continue;
      }

      i++;
    }

    return out;
  }, [
    effectiveOrder,
    evolutionCAData,
    activiteClientsData,
    widgetCtx,
    rendezVousAVenir,
    router,
    devis,
  ]);

  const dateLabel = useMemo(() => {
    return currentDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const greeting = useMemo(() => {
    const h = currentDate.getHours();
    if (h < 6) return "Bonne nuit";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  }, [currentDate]);

  return (
    <div className={dashboardShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="relative mb-6 overflow-hidden px-4 sm:px-6 md:mb-8 md:px-0">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[32px] font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                {greeting}{" "}
                <span aria-hidden>👋</span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500 sm:text-[15px]">
                <span className="capitalize">{dateLabel}</span> · voici un aperçu de votre activité.
              </p>
            </div>
            <Link
              href="/parametres"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200/80 transition-colors hover:bg-zinc-50 sm:self-end"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Personnaliser
            </Link>
          </div>
        </header>

        {blocks}

        {hasNoData ? (
          <div className="px-4 sm:px-6 md:px-0 mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="relative">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
                  <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="font-medium text-zinc-800">Votre tableau de bord est vide</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                  Ajoutez des clients, des factures et des objectifs pour voir les graphiques et les tendances.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/finance"
                    className="inline-flex items-center justify-center rounded-full bg-[#6C5DD3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5B4CC7]"
                  >
                    Aller à Finance
                  </Link>
                  <Link href="/clients" className="py-2.5 px-4 text-sm font-medium text-[#6C5DD3]">
                    Clients
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {factures.length === 0 ? (
              <div className="px-4 sm:px-6 md:px-0 mb-6">
                <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200/90">
                  Aucune facture enregistrée : le CA et les graphiques d&apos;encaissement restent à zéro.{" "}
                  <Link href="/finance" className="font-medium underline underline-offset-2">
                    Créer une facture dans Finance
                  </Link>
                  .
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
