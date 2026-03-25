"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaFileInvoice, FaEye } from "react-icons/fa";
import { FileText } from "lucide-react";
import type { Devis } from "@/app/types";
import { inputFieldClass, panelSurfaceClass, sectionIntroTitleClass, sectionIntroDescClass } from "@/app/components/appCardStyles";

interface DevisTableProps {
  devis: Devis[];
  /** Total hors filtre période (page Finance) */
  totalInDatabase?: number;
  onDelete: (id: string) => void;
  onEdit: (devis: Devis) => void;
  onCreateFacture: (devis: Devis) => void;
  onView: (devis: Devis) => void;
}

export default function DevisTable({ devis, totalInDatabase, onDelete, onEdit, onCreateFacture, onView }: DevisTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredDevis = useMemo(() => {
    return devis.filter((d) => {
      const matchSearch =
        d.numeroDevis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "Tous les statuts" || d.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [devis, searchTerm, statusFilter]);

  const isFilteredEmpty = devis.length > 0 && filteredDevis.length === 0;
  const totalAll = totalInDatabase ?? devis.length;
  const isPeriodEmpty = devis.length === 0 && totalAll > 0;
  const isDatabaseEmpty = devis.length === 0 && totalAll === 0;

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Accepté":
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Envoyé":
        return "bg-amber-600/90 text-white dark:bg-amber-500/75";
      case "Brouillon":
        return "bg-zinc-500 text-white";
      case "Refusé":
        return "bg-red-600/90 text-white dark:bg-red-500/75";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Liste des devis</h2>
        <p className={sectionIntroDescClass}>
          {devis.length === 0 && totalAll === 0
            ? "Aucun devis pour le moment."
            : devis.length === 0 && totalAll > 0
              ? `Aucun devis sur la période affichée (${totalAll} au total).`
              : `${devis.length} devis — recherchez par numéro ou client, filtrez par statut. Un devis accepté peut être transformé en facture.`}
        </p>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        <div className="border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/90 px-4 py-4 dark:bg-white/[0.03] sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="finance-search-devis" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  id="finance-search-devis"
                  type="search"
                  autoComplete="off"
                  placeholder="N° de devis ou entreprise…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputFieldClass} pl-10 py-2.5 rounded-xl`}
                />
              </div>
            </div>
            <div className="w-full shrink-0 lg:w-52">
              <label htmlFor="finance-filter-devis" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Statut
              </label>
              <div className="relative">
                <select
                  id="finance-filter-devis"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Envoyé">Envoyé</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isPeriodEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucun devis sur cette période</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Passez sur « Tout » en haut de page pour voir l’historique, ou créez un devis daté de ce mois.
              </p>
            </div>
          ) : isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-zinc-100 p-5 dark:bg-white/[0.06]">
                <FileText className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Aucun devis enregistré</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Utilisez <span className="font-medium text-zinc-700 dark:text-zinc-300">Nouveau devis</span> en haut de la page pour créer un premier devis.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Modifiez la recherche ou le filtre de statut, ou réinitialisez ci-dessous.
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDevis.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">{d.numeroDevis}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{d.entreprise}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(d.statut)}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{d.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                        {d.prix.toLocaleString("fr-FR")} €
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(d)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/[0.1] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                        >
                          <FaEye className="text-xs" /> Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => onCreateFacture(d)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#ED8600] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-95 dark:bg-[#5b7fb8]"
                        >
                          <FaFileInvoice className="text-xs" /> Facture
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(d)}
                          className="p-2 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                          aria-label="Plus d’options"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(d.id)}
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
