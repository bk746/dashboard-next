"use client";

import { useState, useEffect } from "react";
import type { Client, Depense, Devis, Facture } from "@/app/types";
import RevenueEncaisseCard from "./finance_components/RevenueEncaisseCard";
import EnAttenteCard from "./finance_components/EnAttenteCard";
import EnRetardCard from "./finance_components/EnRetardCard";
import DepenseCard from "./finance_components/DepenseCard";
import DepenseForm from "./finance_components/DepenseForm";
import FacturesTable from "./finance_components/FacturesTable";
import FactureForm from "./finance_components/FactureForm";
import DevisTable from "./finance_components/DevisTable";
import DevisForm from "./finance_components/DevisForm";
import DevisDocument from "./finance_components/DevisDocument";
import FactureDocument from "./finance_components/FactureDocument";

type Tab = "devis" | "factures";

export default function Finance() {
  const [tab, setTab] = useState<Tab>("factures");
  const [clients, setClients] = useState<Client[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [factureFromDevis, setFactureFromDevis] = useState<Devis | null>(null);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [viewingDevis, setViewingDevis] = useState<Devis | null>(null);
  const [viewingFacture, setViewingFacture] = useState<Facture | null>(null);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [isInitialLoadClients, setIsInitialLoadClients] = useState(true);
  const [isInitialLoadFactures, setIsInitialLoadFactures] = useState(true);
  const [isInitialLoadDevis, setIsInitialLoadDevis] = useState(true);
  const [isInitialLoadDepenses, setIsInitialLoadDepenses] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("clients");
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur chargement clients:", e);
      }
    }
    setIsInitialLoadClients(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("factures");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFactures(parsed);
        if (parsed.length > 0) {
          const savedClients = localStorage.getItem("clients");
          if (savedClients) {
            const all = JSON.parse(savedClients);
            const updated = all.map((c: Client) => ({
              ...c,
              caTotal: parsed
                .filter((f: Facture) => f.entreprise === c.entreprise)
                .reduce((s: number, f: Facture) => s + f.prix, 0),
            }));
            setClients(updated);
            localStorage.setItem("clients", JSON.stringify(updated));
          }
        }
      } catch (e) {
        console.error("Erreur chargement factures:", e);
      }
    }
    setIsInitialLoadFactures(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("devis");
    if (saved) {
      try {
        setDevis(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur chargement devis:", e);
      }
    }
    setIsInitialLoadDevis(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoadFactures && typeof window !== "undefined") {
      localStorage.setItem("factures", JSON.stringify(factures));
    }
  }, [factures, isInitialLoadFactures]);

  useEffect(() => {
    if (!isInitialLoadDevis && typeof window !== "undefined") {
      localStorage.setItem("devis", JSON.stringify(devis));
    }
  }, [devis, isInitialLoadDevis]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("depenses");
    if (saved) {
      try {
        setDepenses(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur chargement dépenses:", e);
      }
    }
    setIsInitialLoadDepenses(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoadDepenses && typeof window !== "undefined") {
      localStorage.setItem("depenses", JSON.stringify(depenses));
    }
  }, [depenses, isInitialLoadDepenses]);

  const updateClientsCaTotal = (facturesList: Facture[]) => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("clients");
    if (!saved) return;
    try {
      const all = JSON.parse(saved);
      const updated = all.map((c: Client) => ({
        ...c,
        caTotal: facturesList
          .filter((f) => f.entreprise === c.entreprise)
          .reduce((s, f) => s + f.prix, 0),
      }));
      setClients(updated);
      localStorage.setItem("clients", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur mise à jour CA clients:", e);
    }
  };

  const revenueEncaisse = factures.filter((f) => f.statut === "Payé").reduce((s, f) => s + f.prix, 0);
  const enAttente = factures.filter((f) => f.statut === "Non payé").reduce((s, f) => s + f.prix, 0);
  const enRetard = 0;

  const handleSaveFacture = (facture: Facture) => {
    const updated = editingFacture
      ? factures.map((f) => (f.id === facture.id ? facture : f))
      : [...factures, facture];
    setFactures(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("factures", JSON.stringify(updated));
    }
    updateClientsCaTotal(updated);
    setEditingFacture(null);
    setFactureFromDevis(null);
    setShowFactureForm(false);
  };

  const handleDeleteFacture = (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    const updated = factures.filter((f) => f.id !== id);
    setFactures(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("factures", JSON.stringify(updated));
    }
    updateClientsCaTotal(updated);
  };

  const handleSaveDevis = (d: Devis) => {
    const updated = editingDevis ? devis.map((x) => (x.id === d.id ? d : x)) : [...devis, d];
    setDevis(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("devis", JSON.stringify(updated));
    }
    setEditingDevis(null);
    setShowDevisForm(false);
  };

  const handleDeleteDevis = (id: string) => {
    if (!confirm("Supprimer ce devis ?")) return;
    const updated = devis.filter((d) => d.id !== id);
    setDevis(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("devis", JSON.stringify(updated));
    }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("depenses", JSON.stringify(updated));
    }
    setEditingDepense(null);
    setShowDepenseForm(false);
  };

  const handleDeleteDepense = (id: string) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    const updated = depenses.filter((d) => d.id !== id);
    setDepenses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("depenses", JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] p-3 sm:p-4 md:p-8 md:px-10 lg:px-12">
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium mb-1 md:block">Trésorerie</p>
              <h1 className="text-[#ED8600] font-bold text-2xl sm:text-xl md:text-[28px] tracking-tight">Finance</h1>
              <p className="text-gray-500 text-sm sm:text-base md:text-[15px] mt-0.5">Devis et factures</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingDevis(null);
                  setShowDevisForm(true);
                }}
                className="px-4 sm:px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-gray-300 font-medium text-sm shadow-sm transition-all duration-200"
              >
                Nouveau devis
              </button>
              <button
                onClick={() => {
                  setEditingFacture(null);
                  setFactureFromDevis(null);
                  setShowFactureForm(true);
                }}
                className="px-4 sm:px-6 py-2.5 bg-[#ED8600] rounded-xl text-white font-medium text-sm shadow-lg shadow-[#ED8600]/25 hover:shadow-[#ED8600]/30 hover:opacity-95 transition-all duration-200"
              >
                Nouvelle facture
              </button>
              <button
                onClick={() => {
                  setEditingDepense(null);
                  setShowDepenseForm(true);
                }}
                className="px-4 sm:px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-gray-300 font-medium text-sm shadow-sm transition-all duration-200"
              >
                Nouvelle dépense
              </button>
            </div>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden md:block" />
          <div className="flex gap-0 mt-6 md:mt-6 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setTab("devis")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${tab === "devis" ? "bg-transparent text-[#ED8600] border-[#ED8600]" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/50"}`}
            >
              Devis
            </button>
            <button
              onClick={() => setTab("factures")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${tab === "factures" ? "bg-transparent text-[#ED8600] border-[#ED8600]" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/50"}`}
            >
              Factures
            </button>
          </div>
        </header>

      {tab === "factures" && (
        <>
          <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-6">
              <RevenueEncaisseCard revenueEncaisse={revenueEncaisse} />
              <EnAttenteCard enAttente={enAttente} />
              <EnRetardCard enRetard={enRetard} />
              <DepenseCard depenses={depenses} />
            </div>
          </section>
          {depenses.length > 0 && (
            <div className="px-4 sm:px-6 md:px-0 pb-4 md:pb-6">
              <div className="border border-gray-200 md:rounded-2xl md:shadow-[0_1px_3px_rgba(0,0,0,0.06)] bg-white md:bg-white overflow-hidden">
                <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-600 font-semibold text-sm md:text-base">Liste des dépenses</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left p-4 text-gray-500 text-sm font-semibold">Désignation</th>
                        <th className="text-left p-4 text-gray-500 text-sm font-semibold">Montant</th>
                        <th className="text-left p-4 text-gray-500 text-sm font-semibold">Type</th>
                        <th className="text-left p-4 text-gray-500 text-sm font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {depenses.map((d) => (
                        <tr key={d.id} className="border-b border-gray-300 hover:bg-gray-200">
                          <td className="p-4 text-gray-500 text-sm">{d.libelle}</td>
                          <td className="p-4 text-gray-500 text-sm">{d.montant.toLocaleString("fr-FR")} €</td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${d.type === "Récurrent" ? "bg-amber-200 text-amber-900" : "bg-gray-300 text-gray-700"}`}>
                              {d.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => { setEditingDepense(d); setShowDepenseForm(true); }}
                              className="text-gray-500 hover:text-gray-600 text-sm mr-2"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteDepense(d.id)}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <section className="px-4 sm:px-6 md:px-0" aria-label="Liste des factures">
            <FacturesTable
              factures={factures}
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
        <section className="px-4 sm:px-6 md:px-0" aria-label="Devis">
          <DevisTable
          devis={devis}
          onDelete={handleDeleteDevis}
          onEdit={(d) => {
            setEditingDevis(d);
            setShowDevisForm(true);
          }}
          onCreateFacture={handleCreateFactureFromDevis}
          onView={(d) => setViewingDevis(d)}
          />
        </section>
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
          onClose={() => { setShowDepenseForm(false); setEditingDepense(null); }}
          onSave={handleSaveDepense}
        />
      )}
    </div>
  );
}
