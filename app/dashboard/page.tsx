"use client";

import { useMemo, Fragment } from "react";
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
  isChartWidgetId,
  isKpiGridWidgetId,
  isFullWidthWidgetId,
  type DashboardLayoutPrefs,
  type DashboardWidgetId,
} from "@/app/lib/dashboardLayout";
import { getActuelPourObjectif, normalizeObjectifPeriode, getFinancierEncaisseLabel } from "@/app/lib/objectifsPeriod";
import {
  auditPasEncoreEnvoye,
  besoinRelanceAppelSemaine,
  besoinRelanceMailJ3,
  listeRendezVousAVenir,
  migrateProspect,
  prospectEnCours,
} from "@/app/prospection/prospection_utils";
import DevisKpiStrip from "@/app/finance/finance_components/DevisKpiStrip";
import RendezVousAVenirCard from "@/app/prospection/prospection_components/RendezVousAVenirCard";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
  panelSurfaceClass,
  primaryButtonClass,
  staggerCardsGridClass,
} from "@/app/components/appCardStyles";
import EvolutionCACard from "./dashboard_components/EvolutionCACard";
import NouveauxClientsCard from "./dashboard_components/NouveauxClientsCard";
import DashboardQuickLinks from "./dashboard_components/DashboardQuickLinks";
import DashboardFinanceHint from "./dashboard_components/DashboardFinanceHint";
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
  const [layoutRaw] = useJsonBucket<DashboardLayoutPrefs>("dashboardLayout", defaultDashboardLayoutPrefs());

  const prefs = useMemo(() => normalizeDashboardLayoutPrefs(layoutRaw), [layoutRaw]);
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

  const montantImpayes = useMemo(
    () => factures.filter((f) => f.statut === "Non payé").reduce((s, f) => s + getResteAPayerFacture(f), 0),
    [factures]
  );

  const nbFacturesImpayees = useMemo(() => factures.filter((f) => f.statut === "Non payé").length, [factures]);

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

  const { prospectsEnCours, auditsAEnvoyer, relancesMailAFaire, relancesAppelAFaire, rendezVousAVenir } = useMemo(() => {
    return {
      prospectsEnCours: prospectsM.filter((p) => prospectEnCours(p)).length,
      auditsAEnvoyer: prospectsM.filter((p) => auditPasEncoreEnvoye(p)).length,
      relancesMailAFaire: prospectsM.filter((p) => besoinRelanceMailJ3(p)).length,
      relancesAppelAFaire: prospectsM.filter((p) => besoinRelanceAppelSemaine(p)).length,
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
      relancesMailAFaire,
      relancesAppelAFaire,
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
      relancesMailAFaire,
      relancesAppelAFaire,
      progressionObjectifsTotal,
    ]
  );

  const hasNoData = factures.length === 0 && clients.length === 0;

  const effectiveOrder = useMemo(() => {
    if (!hasNoData) return visibleOrder;
    return visibleOrder.filter((id) => id === "quickLinks" || id === "financeHint");
  }, [hasNoData, visibleOrder]);

  const blocks = useMemo(() => {
    const out: React.ReactNode[] = [];
    let i = 0;
    const order = effectiveOrder;

    while (i < order.length) {
      const id = order[i];

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
                {wid === "financeHint" ? (
                  <DashboardFinanceHint montantImpayes={montantImpayes} nbFacturesImpayees={nbFacturesImpayees} />
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
        const hasEv = batch.includes("chartEvolutionCa");
        const hasAc = batch.includes("chartActiviteClients");
        out.push(
          <section key={`charts-${out.length}`} className="px-4 sm:px-6 md:px-0 mb-8" aria-labelledby="dash-charts-heading">
            <div className="mb-4">
              <h2 id="dash-charts-heading" className={sectionIntroTitleClass}>
                Tendances
              </h2>
              <p className={sectionIntroDescClass}>
                Encaissements et activité client (dernière activité) sur 12 mois glissants.
              </p>
            </div>
            <div
              className={`grid grid-cols-1 gap-4 sm:gap-6 md:gap-6 ${hasEv && hasAc ? "lg:grid-cols-3" : ""}`}
            >
              {hasEv ? (
                <div className={hasAc ? "lg:col-span-2 min-h-[380px] sm:min-h-[440px]" : "min-h-[380px] sm:min-h-[440px]"}>
                  <EvolutionCACard data={evolutionCAData} />
                </div>
              ) : null}
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
                <h2 id="dash-devis-kpi" className={sectionIntroTitleClass}>
                  Vue d&apos;ensemble devis
                </h2>
                <p className={sectionIntroDescClass}>
                  Montants signés, pipeline (brouillon + envoyé) et refus — même indicateurs que sur la page Finance (devis).
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
            aria-labelledby="dash-cards-heading"
          >
            <div className="mb-4">
              <h2 id="dash-cards-heading" className={sectionIntroTitleClass}>
                Cartes & indicateurs
              </h2>
              <p className={sectionIntroDescClass}>
                Blocs issus des pages Clients, Finance, Deals, Prospection et Objectifs — activables dans Paramètres → Dashboard.
              </p>
            </div>
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
    montantImpayes,
    nbFacturesImpayees,
    evolutionCAData,
    activiteClientsData,
    widgetCtx,
    rendezVousAVenir,
    router,
    devis,
  ]);

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div>
            <p className={pageEyebrowClass}>Tableau de bord</p>
            <h1 className={pageTitleClass}>Dashboard</h1>
            <p className={pageSubtitleClass}>
              Composez votre première page avec les cartes du site — Paramètres → Dashboard.
            </p>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>

        {blocks}

        {hasNoData ? (
          <div className="px-4 sm:px-6 md:px-0 mb-8">
            <div className={`${panelSurfaceClass} p-8 text-center`}>
              <p className="text-zinc-800 dark:text-zinc-200 font-medium">Votre tableau de bord est vide</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Ajoutez des clients, des factures et des objectifs pour voir les graphiques et les tendances.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/finance" className={primaryButtonClass}>
                  Aller à Finance
                </Link>
                <Link href="/clients" className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9] py-2.5 px-4">
                  Clients
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {factures.length === 0 ? (
              <div className="px-4 sm:px-6 md:px-0 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
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
