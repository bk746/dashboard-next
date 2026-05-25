"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Euro,
  Clock,
  AlertTriangle,
  Wallet,
  Scale,
  FileText,
} from "lucide-react";
import type { Client, Depense, Devis, Facture } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import DashboardToneKpiCard, {
  DashboardToneBadge,
} from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import {
  financeShellClass,
  financePrimaryBtn,
  financeSecondaryBtn,
  financeSegmentedBar,
  financeTabActive,
  financeTabInactive,
} from "./financeUi";
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

function formatEuro(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

export default function Finance() {
  const [tab, setTab] = useState<Tab>("factures");
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
      ? "Encaissé ce mois (payé + acomptes)"
      : "Encaissé — toutes périodes";

  const hintAttente =
    periodScope === "month" ? "Impayées émises ce mois" : "Impayées — toutes périodes";

  const hintDepense =
    periodScope === "month" ? "Récurrents + occasionnels du mois" : "Toutes les charges";

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

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
    <div className={financeShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-[#5E549E] sm:text-[28px]">
                Finance
              </h1>
              <p className="mt-1 text-sm text-zinc-500 capitalize">{dateLabel}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <div className={financeSegmentedBar} role="tablist" aria-label="Devis ou factures">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "devis"}
                    onClick={() => setTab("devis")}
                    className={tab === "devis" ? financeTabActive : financeTabInactive}
                  >
                    Devis
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "factures"}
                    onClick={() => setTab("factures")}
                    className={tab === "factures" ? financeTabActive : financeTabInactive}
                  >
                    Factures
                  </button>
                </div>
                <div className={financeSegmentedBar} role="group" aria-label="Période">
                  <button
                    type="button"
                    onClick={() => setPeriodScope("month")}
                    className={periodScope === "month" ? financeTabActive : financeTabInactive}
                  >
                    Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodScope("all")}
                    className={periodScope === "all" ? financeTabActive : financeTabInactive}
                  >
                    Tout
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDevis(null);
                    setShowDevisForm(true);
                  }}
                  className={financePrimaryBtn}
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Devis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDepense(null);
                    setShowDepenseForm(true);
                  }}
                  className={financeSecondaryBtn}
                >
                  <Wallet className="h-4 w-4" aria-hidden />
                  Dépense
                </button>
              </div>
            </div>
          </div>
        </header>

        {tab === "factures" && (
          <>
            <section aria-label="Indicateurs finance">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
                <DashboardToneKpiCard
                  tone="violet"
                  label="Revenu encaissé"
                  subtitle={hintRevenue}
                  value={formatEuro(revenueEncaisse)}
                  icon={<Euro aria-hidden />}
                />
                <DashboardToneKpiCard
                  tone="pink"
                  label="En attente"
                  subtitle={hintAttente}
                  value={formatEuro(enAttente)}
                  icon={<Clock aria-hidden />}
                  footer={<DashboardToneBadge variant="warn">Non payé</DashboardToneBadge>}
                />
                <DashboardToneKpiCard
                  tone="pink"
                  label="En retard"
                  subtitle="Impayées, date passée — toutes périodes"
                  value={formatEuro(enRetard)}
                  icon={<AlertTriangle aria-hidden />}
                  footer={<DashboardToneBadge variant="warn">À relancer</DashboardToneBadge>}
                />
                <DashboardToneKpiCard
                  tone="violet"
                  label="Dépenses"
                  subtitle={hintDepense}
                  value={formatEuro(depenseTotals.total)}
                  icon={<Wallet aria-hidden />}
                  footer={
                    depenseTotals.totalRecurrent > 0 || depenseTotals.totalOccasionnel > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {depenseTotals.totalRecurrent > 0 ? (
                          <DashboardToneBadge>Réc. {formatEuro(depenseTotals.totalRecurrent)}</DashboardToneBadge>
                        ) : null}
                        {depenseTotals.totalOccasionnel > 0 ? (
                          <DashboardToneBadge>Occ. {formatEuro(depenseTotals.totalOccasionnel)}</DashboardToneBadge>
                        ) : null}
                      </div>
                    ) : null
                  }
                />
                <DashboardToneKpiCard
                  tone={soldeNet >= 0 ? "violet" : "pink"}
                  label="Synthèse nette"
                  subtitle={`Encaissé − dépenses (${periodLabelLong})`}
                  value={formatEuro(soldeNet)}
                  icon={<Scale aria-hidden />}
                  footer={
                    <DashboardToneBadge variant={soldeNet >= 0 ? "success" : "warn"}>
                      {soldeNet >= 0 ? "Positif" : "Négatif"}
                    </DashboardToneBadge>
                  }
                />
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

            <section aria-label="Liste des factures">
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
            <section aria-label="Devis">
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

      {showFactureForm ? (
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
      ) : null}

      {showDevisForm ? (
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
      ) : null}

      {viewingDevis ? (
        <DevisDocument
          devis={viewingDevis}
          client={clients.find((c) => c.entreprise === viewingDevis.entreprise) ?? null}
          onClose={() => setViewingDevis(null)}
        />
      ) : null}

      {viewingFacture ? (
        <FactureDocument
          facture={viewingFacture}
          client={clients.find((c) => c.entreprise === viewingFacture.entreprise) ?? null}
          onClose={() => setViewingFacture(null)}
        />
      ) : null}

      {showDepenseForm ? (
        <DepenseForm
          depense={editingDepense}
          onClose={() => {
            setShowDepenseForm(false);
            setEditingDepense(null);
          }}
          onSave={handleSaveDepense}
        />
      ) : null}
    </div>
  );
}
