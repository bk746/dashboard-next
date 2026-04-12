"use client";

import { useState, useEffect, useMemo } from "react";
import type { Client, Depense, Devis, Facture } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  primaryButtonClass,
  secondaryButtonClass,
  segmentedBarClass,
  segmentedTabActiveClass,
  segmentedTabInactiveClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
  staggerCardsGridClass,
} from "@/app/components/appCardStyles";
import RevenueEncaisseCard from "./finance_components/RevenueEncaisseCard";
import EnAttenteCard from "./finance_components/EnAttenteCard";
import EnRetardCard from "./finance_components/EnRetardCard";
import DepenseCard from "./finance_components/DepenseCard";
import SyntheseNetCard from "./finance_components/SyntheseNetCard";
import DepenseForm from "./finance_components/DepenseForm";
import DepensesTable from "./finance_components/DepensesTable";
import FacturesTable from "./finance_components/FacturesTable";
import FactureForm from "./finance_components/FactureForm";
import DevisTable from "./finance_components/DevisTable";
import DevisForm from "./finance_components/DevisForm";
import DevisDocument from "./finance_components/DevisDocument";
import FactureDocument from "./finance_components/FactureDocument";
import DevisKpiStrip from "./finance_components/DevisKpiStrip";
import {
  filterFacturesByPeriod,
  filterDevisByPeriod,
  filterDepensesForDisplay,
  computeDepenseTotals,
  isFactureEnRetard,
  getResteAPayerFacture,
  getMontantEncaisseFacture,
} from "./utils";

type Tab = "devis" | "factures";

export default function Finance() {
  const [tab, setTab] = useState<Tab>("devis");
  const [periodScope, setPeriodScope] = useState<"month" | "all">("month");
  const [clients, setClients, ready] = useJsonBucket<Client[]>("clients", []);
  const [devis, setDevis] = useJsonBucket<Devis[]>("devis", []);
  const [factures, setFactures] = useJsonBucket<Facture[]>("factures", []);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [factureFromDevis, setFactureFromDevis] = useState<Devis | null>(null);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [viewingDevis, setViewingDevis] = useState<Devis | null>(null);
  const [viewingFacture, setViewingFacture] = useState<Facture | null>(null);
  const [depenses, setDepenses] = useJsonBucket<Depense[]>("depenses", []);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);

  useEffect(() => {
    if (!ready) return;
    const next = clients.map((c) => ({
      ...c,
      caTotal: factures
        .filter((f) => f.entreprise === c.entreprise)
        .reduce((s, f) => s + getMontantEncaisseFacture(f), 0),
    }));
    const same =
      next.length === clients.length &&
      next.every((c, i) => c.caTotal === clients[i]?.caTotal);
    if (same) return;
    setClients(next);
  }, [factures, clients, ready, setClients]);

  const facturesInPeriod = useMemo(() => filterFacturesByPeriod(factures, periodScope), [factures, periodScope]);

  const revenueEncaisse = useMemo(
    () => facturesInPeriod.reduce((s, f) => s + getMontantEncaisseFacture(f), 0),
    [facturesInPeriod]
  );

  const enAttente = useMemo(
    () => facturesInPeriod.filter((f) => f.statut === "Non payé").reduce((s, f) => s + getResteAPayerFacture(f), 0),
    [facturesInPeriod]
  );

  const enRetard = useMemo(
    () => factures.filter((f) => isFactureEnRetard(f)).reduce((s, f) => s + getResteAPayerFacture(f), 0),
    [factures]
  );

  const depenseTotals = useMemo(() => computeDepenseTotals(depenses, periodScope), [depenses, periodScope]);

  const soldeNet = revenueEncaisse - depenseTotals.total;

  const facturesForTable = useMemo(() => facturesInPeriod, [facturesInPeriod]);

  const devisForTable = useMemo(() => filterDevisByPeriod(devis, periodScope), [devis, periodScope]);

  const depensesForTable = useMemo(() => filterDepensesForDisplay(depenses, periodScope), [depenses, periodScope]);

  const periodLabelLong = periodScope === "month" ? "Mois en cours" : "Tout historique";

  const hintRevenue =
    periodScope === "month"
      ? "Montants encaissés ce mois (factures payées + acomptes sur impayées, date de facture)"
      : "Montants encaissés (payé intégral + acomptes, date de facture)";

  const hintAttente =
    periodScope === "month" ? "Factures impayées — émises ce mois" : "Factures impayées — toutes périodes";

  const hintDepense =
    periodScope === "month"
      ? "Récurrents (mois) + occasionnels datés ce mois"
      : "Somme de toutes les lignes (récurrent + occasionnel)";

  const handleSaveFacture = (facture: Facture) => {
    const updated = editingFacture
      ? factures.map((f) => (f.id === facture.id ? facture : f))
      : [...factures, facture];
    setFactures(updated);
    setEditingFacture(null);
    setFactureFromDevis(null);
    setShowFactureForm(false);
  };

  const handleDeleteFacture = (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    setFactures(factures.filter((f) => f.id !== id));
  };

  const handleSaveDevis = (d: Devis) => {
    const updated = editingDevis ? devis.map((x) => (x.id === d.id ? d : x)) : [...devis, d];
    setDevis(updated);
    setEditingDevis(null);
    setShowDevisForm(false);
  };

  const handleDeleteDevis = (id: string) => {
    if (!confirm("Supprimer ce devis ?")) return;
    setDevis(devis.filter((d) => d.id !== id));
  };

  const handleCreateFactureFromDevis = (d: Devis) => {
    setFactureFromDevis(d);
    setEditingFacture(null);
    setShowFactureForm(true);
  };

  const handleSaveDepense = (dep: Depense) => {
    const updated = editingDepense
      ? depenses.map((d) => (d.id === dep.id ? dep : d))
      : [...depenses, dep];
    setDepenses(updated);
    setEditingDepense(null);
    setShowDepenseForm(false);
  };

  const handleDeleteDepense = (id: string) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    setDepenses(depenses.filter((d) => d.id !== id));
  };

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={pageEyebrowClass}>Trésorerie</p>
              <h1 className={pageTitleClass}>Finance</h1>
              <p className={pageSubtitleClass}>
                {tab === "factures"
                  ? "Indicateurs, synthèse nette et factures — les nouvelles factures se créent depuis un devis accepté."
                  : "Créez un devis, puis une facture depuis le formulaire (statut Accepté) ou depuis la liste."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingDevis(null);
                  setShowDevisForm(true);
                }}
                className={`${primaryButtonClass} w-full sm:w-auto !px-4 sm:!px-6 text-sm`}
              >
                Créer un devis
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingDepense(null);
                  setShowDepenseForm(true);
                }}
                className={secondaryButtonClass}
              >
                Nouvelle dépense
              </button>
            </div>
          </div>
          <div className={pageDividerClass} aria-hidden />
          <div
            className="mt-6 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:items-center sm:justify-between"
            role="tablist"
            aria-label="Type de document"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Afficher</p>
            <div className={segmentedBarClass}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "devis"}
                onClick={() => setTab("devis")}
                className={tab === "devis" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Devis
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "factures"}
                onClick={() => setTab("factures")}
                className={tab === "factures" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Factures
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-0">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Période (KPI, tableaux, synthèse)</p>
            <div className={segmentedBarClass} role="group" aria-label="Période">
              <button
                type="button"
                onClick={() => setPeriodScope("month")}
                className={periodScope === "month" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Mois en cours
              </button>
              <button
                type="button"
                onClick={() => setPeriodScope("all")}
                className={periodScope === "all" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Tout
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Période sélectionnée : <span className="font-medium text-zinc-700 dark:text-zinc-300">{periodLabelLong}</span>
            . Les cartes « En retard » et les indicateurs devis (pipeline / acceptés) restent calculés sur tout le
            portefeuille.
          </p>
        </header>

        {tab === "factures" && (
          <>
            <section className="mb-6 px-4 sm:px-6 md:mb-8 md:px-0" aria-label="Indicateurs">
              <div className="mb-4">
                <h2 className={sectionIntroTitleClass}>Vue d&apos;ensemble</h2>
                <p className={sectionIntroDescClass}>
                  Encaissements et impayés selon la période, retards (toutes périodes), dépenses et synthèse nette
                  (encaissé − charges).
                </p>
              </div>
              <div
                className={`grid ${staggerCardsGridClass} grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4`}
              >
                <RevenueEncaisseCard revenueEncaisse={revenueEncaisse} periodHint={hintRevenue} />
                <EnAttenteCard enAttente={enAttente} periodHint={hintAttente} />
                <EnRetardCard enRetard={enRetard} />
                <DepenseCard
                  total={depenseTotals.total}
                  totalRecurrent={depenseTotals.totalRecurrent}
                  totalOccasionnel={depenseTotals.totalOccasionnel}
                  periodHint={hintDepense}
                />
                <SyntheseNetCard net={soldeNet} periodLabel={periodLabelLong} />
              </div>
            </section>

            <DepensesTable
              depenses={depensesForTable}
              totalInDatabase={depenses.length}
              onEdit={(d) => {
                setEditingDepense(d);
                setShowDepenseForm(true);
              }}
              onDelete={handleDeleteDepense}
              onAdd={() => {
                setEditingDepense(null);
                setShowDepenseForm(true);
              }}
            />

            <section className="px-4 sm:px-6 md:px-0" aria-label="Liste des factures">
              <FacturesTable
                factures={facturesForTable}
                totalInDatabase={factures.length}
                onDelete={handleDeleteFacture}
                onEdit={(f) => {
                  setEditingFacture(f);
                  setFactureFromDevis(null);
                  setShowFactureForm(true);
                }}
                onView={(f) => setViewingFacture(f)}
              />
            </section>
          </>
        )}

        {tab === "devis" && (
          <>
            <DevisKpiStrip devis={devis} />
            <section className="px-4 sm:px-6 md:px-0" aria-label="Devis">
              <DevisTable
                devis={devisForTable}
                totalInDatabase={devis.length}
                onDelete={handleDeleteDevis}
                onEdit={(d) => {
                  setEditingDevis(d);
                  setShowDevisForm(true);
                }}
                onCreateFacture={handleCreateFactureFromDevis}
                onView={(d) => setViewingDevis(d)}
              />
            </section>
          </>
        )}
      </div>

      {showFactureForm && (
        <FactureForm
          facture={editingFacture}
          fromDevis={factureFromDevis}
          clients={clients}
          onClose={() => {
            setShowFactureForm(false);
            setEditingFacture(null);
            setFactureFromDevis(null);
          }}
          onSave={handleSaveFacture}
        />
      )}

      {showDevisForm && (
        <DevisForm
          devis={editingDevis}
          clients={clients}
          onClose={() => {
            setShowDevisForm(false);
            setEditingDevis(null);
          }}
          onSave={handleSaveDevis}
          onCreateFacture={handleCreateFactureFromDevis}
        />
      )}

      {viewingDevis && (
        <DevisDocument
          devis={viewingDevis}
          client={clients.find((c) => c.entreprise === viewingDevis.entreprise) ?? null}
          onClose={() => setViewingDevis(null)}
        />
      )}

      {viewingFacture && (
        <FactureDocument
          facture={viewingFacture}
          client={clients.find((c) => c.entreprise === viewingFacture.entreprise) ?? null}
          onClose={() => setViewingFacture(null)}
        />
      )}

      {showDepenseForm && (
        <DepenseForm
          depense={editingDepense}
          onClose={() => {
            setShowDepenseForm(false);
            setEditingDepense(null);
          }}
          onSave={handleSaveDepense}
        />
      )}
    </div>
  );
}
