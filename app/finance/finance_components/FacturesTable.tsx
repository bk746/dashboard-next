"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaEye } from "react-icons/fa";
import { Receipt } from "lucide-react";
import type { Facture } from "@/app/types";
import { normalizeAbonnement } from "@/lib/abonnement";
import { getMontantAcompteFacture, getResteAPayerFacture } from "@/app/finance/utils";
import { financeFloatingCard, financeInputClass } from "@/app/finance/financeUi";

interface FacturesTableProps {
  factures: Facture[];
  /** Total hors filtre période (page Finance) — pour message « aucune sur la période » */
  totalInDatabase?: number;
  onDelete: (id: string) => void;
  onEdit: (facture: Facture) => void;
  onView: (facture: Facture) => void;
}

export default function FacturesTable({ factures, totalInDatabase, onDelete, onEdit, onView }: FacturesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredFactures = useMemo(
    () =>
      factures.filter((facture) => {
        const matchesSearch =
          facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facture.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "Tous les statuts" || facture.statut === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [factures, searchTerm, statusFilter]
  );

  const isFilteredEmpty = factures.length > 0 && filteredFactures.length === 0;
  const totalAll = totalInDatabase ?? factures.length;
  const isPeriodEmpty = factures.length === 0 && totalAll > 0;
  const isDatabaseEmpty = factures.length === 0 && totalAll === 0;

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Payé":
        return "bg-emerald-500/15 text-emerald-800";
      case "Non payé":
        return "bg-amber-500/15 text-amber-800";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  const getAbonnementBadgeColor = (abonnement: string) => {
    const a = normalizeAbonnement(abonnement);
    switch (a) {
      case "Croissance":
        return "bg-violet-500/12 text-violet-800";
      case "Performance":
        return "bg-emerald-500/12 text-emerald-800";
      case "Essentiel":
        return "bg-sky-500/12 text-sky-800";
      case "Aucun":
        return "border border-zinc-200 bg-zinc-50 text-zinc-500";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className={financeFloatingCard}>
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:px-6">
        <p className="mb-3 text-sm font-semibold text-[#5E549E]">Liste des factures</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="finance-search-factures" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
                  aria-hidden
                />
                <input
                  id="finance-search-factures"
                  type="search"
                  autoComplete="off"
                  placeholder="N° de facture ou nom d'entreprise…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${financeInputClass} pl-10`}
                />
              </div>
            </div>
            <div className="w-full shrink-0 lg:w-52">
              <label htmlFor="finance-filter-factures" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Statut
              </label>
              <div className="relative">
                <select
                  id="finance-filter-factures"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${financeInputClass} appearance-none cursor-pointer pr-9`}
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="Payé">Payé</option>
                  <option value="Non payé">Non payé</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
              </div>
            </div>
          </div>
        <p className="mt-3 text-xs text-zinc-500">
          {factures.length === 0 && totalAll === 0
            ? "Aucune facture enregistrée."
            : factures.length === 0 && totalAll > 0
              ? `Aucune facture sur la période (${totalAll} au total).`
              : `${factures.length} facture${factures.length > 1 ? "s" : ""} affichée${factures.length !== totalAll ? ` / ${totalAll}` : ""}`}
        </p>
      </div>

      <div className="overflow-x-auto">
          {isPeriodEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucune facture sur cette période</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Passez la page Finance sur « Tout » pour voir l’historique complet, ou créez un devis puis une facture (devis au statut Accepté).
              </p>
            </div>
          ) : isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
                <Receipt className="h-7 w-7" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800">Aucune facture pour l’instant</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Créez un devis avec <span className="font-medium text-zinc-700">Créer un devis</span>, passez-le en « Accepté », puis utilisez « Créer une facture à partir du devis » dans le formulaire, ou le bouton Facture sur un devis accepté dans l’onglet Devis.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Aucune facture ne correspond à votre recherche ou au filtre. Effacez la recherche ou choisissez « Tous les statuts ».
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("Tous les statuts");
                }}
                className="mt-5 text-sm font-medium text-[#6C5DD3] underline-offset-4 hover:underline"
              >
                Réinitialiser recherche et filtre
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200/90">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Numéro
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Entreprise
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Statut
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Date
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Montant
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Abonnement
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.map((facture) => (
                  <tr
                    key={facture.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-800">{facture.numeroFacture}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-700">{facture.entreprise}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(facture.statut)}`}>
                        {facture.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600">{facture.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium tabular-nums text-zinc-800">
                        {facture.prix.toLocaleString("fr-FR")} €
                      </span>
                      {facture.statut === "Non payé" && getMontantAcompteFacture(facture) > 0 ? (
                        <span className="mt-0.5 block text-xs tabular-nums text-zinc-500">
                          Reste {getResteAPayerFacture(facture).toLocaleString("fr-FR")} € (acompte{" "}
                          {getMontantAcompteFacture(facture).toLocaleString("fr-FR")} €)
                        </span>
                      ) : null}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAbonnementBadgeColor(facture.abonnement)}`}>
                        {normalizeAbonnement(facture.abonnement)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(facture)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-[#6C5DD3]/30 hover:bg-[#6C5DD3]/[0.04] hover:text-[#6C5DD3]"
                        >
                          <FaEye className="text-xs" /> Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(facture)}
                          className="p-2 text-zinc-500 transition-colors hover:text-[#6C5DD3]"
                          aria-label="Plus d’options"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(facture.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
