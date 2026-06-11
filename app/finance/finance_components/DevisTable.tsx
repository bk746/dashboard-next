"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaFileInvoice, FaEye } from "react-icons/fa";
import { FileText } from "lucide-react";
import type { Devis } from "@/app/types";
import { financeFloatingCard, financeInputClass } from "@/app/finance/financeUi";

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
        return "bg-emerald-500/15 text-emerald-800";
      case "Envoyé":
        return "bg-amber-500/15 text-amber-800";
      case "Brouillon":
        return "bg-zinc-100 text-zinc-600";
      case "Refusé":
        return "bg-rose-500/15 text-rose-800";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <div className={financeFloatingCard}>
      <div className="border-b border-zinc-100 px-4 py-4 sm:px-6 sm:py-5">
        <p className="mb-3 text-[17px] font-semibold tracking-tight text-zinc-900">Devis</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="finance-search-devis" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
                  aria-hidden
                />
                <input
                  id="finance-search-devis"
                  type="search"
                  autoComplete="off"
                  placeholder="N° de devis ou entreprise…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${financeInputClass} pl-10`}
                />
              </div>
            </div>
            <div className="w-full shrink-0 lg:w-52">
              <label htmlFor="finance-filter-devis" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Statut
              </label>
              <div className="relative">
                <select
                  id="finance-filter-devis"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${financeInputClass} appearance-none cursor-pointer pr-9`}
                >
                  <option value="Tous les statuts">Tous les statuts</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Envoyé">Envoyé</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
              </div>
            </div>
          </div>
        <p className="mt-3 text-xs text-zinc-500">
          {devis.length === 0 && totalAll === 0
            ? "Aucun devis."
            : devis.length === 0 && totalAll > 0
              ? `Aucun devis sur la période (${totalAll} au total).`
              : `${devis.length} devis affiché${devis.length !== totalAll ? ` / ${totalAll}` : ""} — un devis accepté peut devenir facture.`}
        </p>
      </div>

      <div className="overflow-x-auto">
          {isPeriodEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucun devis sur cette période</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Passez sur « Tout » en haut de page pour voir l’historique, ou créez un devis daté de ce mois.
              </p>
            </div>
          ) : isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
                <FileText className="h-7 w-7" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800">Aucun devis enregistré</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Utilisez <span className="font-medium text-zinc-700">Nouveau devis</span> en haut de la page pour créer un premier devis.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Modifiez la recherche ou le filtre de statut, ou réinitialisez ci-dessous.
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
                <tr className="border-b border-zinc-100">
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">Numéro</th>
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">Entreprise</th>
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">Statut</th>
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">Date</th>
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">Montant</th>
                  <th className="p-4 text-left text-xs font-medium text-zinc-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDevis.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-800">{d.numeroDevis}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-700">{d.entreprise}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(d.statut)}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600">{d.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium tabular-nums text-zinc-800">
                        {d.prix.toLocaleString("fr-FR")} €
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onView(d)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100/80 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70"
                        >
                          <FaEye className="text-xs" /> Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => onCreateFacture(d)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5DD3] px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5B4CC7]"
                        >
                          <FaFileInvoice className="text-xs" /> Facture
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(d)}
                          className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                          aria-label="Modifier"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(d.id)}
                          className="rounded-full px-3 py-1.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
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
