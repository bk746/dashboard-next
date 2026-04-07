"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaEye } from "react-icons/fa";
import { Receipt } from "lucide-react";
import type { Facture } from "@/app/types";
import { normalizeAbonnement } from "@/lib/abonnement";
import { inputFieldClass, panelSurfaceClass, sectionIntroTitleClass, sectionIntroDescClass } from "@/app/components/appCardStyles";

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
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Non payé":
        return "bg-amber-600/90 text-white dark:bg-amber-500/75";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  const getAbonnementBadgeColor = (abonnement: string) => {
    const a = normalizeAbonnement(abonnement);
    switch (a) {
      case "Croissance":
        return "bg-violet-600/90 text-white dark:bg-violet-500/80";
      case "Performance":
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Essentiel":
        return "bg-zinc-500 text-white";
      case "Aucun":
        return "border border-zinc-400/60 bg-transparent text-zinc-500 dark:border-white/20 dark:text-zinc-400";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Liste des factures</h2>
        <p className={sectionIntroDescClass}>
          {factures.length === 0 && totalAll === 0
            ? "Aucune facture enregistrée pour le moment."
            : factures.length === 0 && totalAll > 0
              ? `Aucune facture sur la période affichée (${totalAll} au total dans l’historique).`
              : `${factures.length} facture${factures.length > 1 ? "s" : ""} — recherchez par numéro ou client, filtrez par statut.`}
        </p>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        <div className="border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/90 px-4 py-4 dark:bg-white/[0.03] sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="finance-search-factures" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  id="finance-search-factures"
                  type="search"
                  autoComplete="off"
                  placeholder="N° de facture ou nom d'entreprise…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputFieldClass} pl-10 py-2.5 rounded-xl`}
                />
              </div>
            </div>
            <div className="w-full shrink-0 lg:w-52">
              <label htmlFor="finance-filter-factures" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Statut
              </label>
              <div className="relative">
                <select
                  id="finance-filter-factures"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${inputFieldClass} appearance-none w-full cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="Payé">Payé</option>
                  <option value="Non payé">Non payé</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isPeriodEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucune facture sur cette période</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Passez la page Finance sur « Tout » pour voir l’historique complet, ou créez un devis puis une facture (devis au statut Accepté).
              </p>
            </div>
          ) : isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-zinc-100 p-5 dark:bg-white/[0.06]">
                <Receipt className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Aucune facture pour l’instant</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Créez un devis avec <span className="font-medium text-zinc-700 dark:text-zinc-300">Créer un devis</span>, passez-le en « Accepté », puis utilisez « Créer une facture à partir du devis » dans le formulaire, ou le bouton Facture sur un devis accepté dans l’onglet Devis.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Aucune facture ne correspond à votre recherche ou au filtre. Effacez la recherche ou choisissez « Tous les statuts ».
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("Tous les statuts");
                }}
                className="mt-5 text-sm font-medium text-[#ED8600] underline-offset-4 hover:underline dark:text-[#8fa9c9]"
              >
                Réinitialiser recherche et filtre
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200/90 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02]">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Numéro
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Entreprise
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Statut
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Date
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Montant
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Abonnement
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.map((facture) => (
                  <tr
                    key={facture.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">{facture.numeroFacture}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{facture.entreprise}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(facture.statut)}`}>
                        {facture.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{facture.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                        {facture.prix.toLocaleString("fr-FR")} €
                      </span>
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
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/[0.1] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                        >
                          <FaEye className="text-xs" /> Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(facture)}
                          className="p-2 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                          aria-label="Plus d’options"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(facture.id)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
    </div>
  );
}
