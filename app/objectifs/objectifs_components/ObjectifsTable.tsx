"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import { Target } from "lucide-react";
import type { Objectif } from "@/app/types";
import { normalizeObjectifPeriode, periodeLabelFr } from "@/app/lib/objectifsPeriod";
import { objectifsFloatingCard, objectifsInputClass } from "@/app/objectifs/objectifsUi";

interface ObjectifsTableProps {
  objectifs: Objectif[];
  onDelete: (id: string) => void;
  onEdit: (objectif: Objectif) => void;
}

export default function ObjectifsTable({ objectifs, onDelete, onEdit }: ObjectifsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous les types");
  const [periodeFilter, setPeriodeFilter] = useState<string>("Toutes les périodes");

  const filteredObjectifs = useMemo(
    () =>
      objectifs.filter((objectif) => {
        const matchesSearch = objectif.libelle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "Tous les types" || objectif.type === typeFilter;
        const p = normalizeObjectifPeriode(objectif.periode);
        const matchesPeriode =
          periodeFilter === "Toutes les périodes" ||
          (periodeFilter === "Année" && p === "annee") ||
          (periodeFilter === "Mois" && p === "mois") ||
          (periodeFilter === "Semaine" && p === "semaine");
        return matchesSearch && matchesType && matchesPeriode;
      }),
    [objectifs, searchTerm, typeFilter, periodeFilter]
  );

  const isFilteredEmpty = objectifs.length > 0 && filteredObjectifs.length === 0;
  const isDatabaseEmpty = objectifs.length === 0;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Financier":
        return "bg-emerald-500/12 text-emerald-800";
      case "Client":
        return "bg-[#6C5DD3]/12 text-[#6C5DD3]";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("Tous les types");
    setPeriodeFilter("Toutes les périodes");
  };

  return (
    <div className={objectifsFloatingCard}>
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:px-6">
        <p className="mb-3 text-sm font-semibold text-zinc-900">Liste détaillée</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label htmlFor="objectifs-search" className="mb-1.5 block text-xs font-medium text-zinc-600">
              Rechercher
            </label>
            <div className="relative">
              <FaSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
                aria-hidden
              />
              <input
                id="objectifs-search"
                type="search"
                autoComplete="off"
                placeholder="Libellé de l'objectif…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${objectifsInputClass} pl-10`}
              />
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:shrink-0 lg:grid-cols-2 lg:gap-4">
            <div className="w-full sm:min-w-[11rem]">
              <label htmlFor="objectifs-filter-type" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Type
              </label>
              <div className="relative">
                <select
                  id="objectifs-filter-type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`${objectifsInputClass} appearance-none cursor-pointer pr-9`}
                >
                  <option value="Tous les types">Tous les types</option>
                  <option value="Financier">Financier</option>
                  <option value="Client">Client</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
              </div>
            </div>
            <div className="w-full sm:min-w-[11rem]">
              <label htmlFor="objectifs-filter-periode" className="mb-1.5 block text-xs font-medium text-zinc-600">
                Période
              </label>
              <div className="relative">
                <select
                  id="objectifs-filter-periode"
                  value={periodeFilter}
                  onChange={(e) => setPeriodeFilter(e.target.value)}
                  className={`${objectifsInputClass} appearance-none cursor-pointer pr-9`}
                >
                  <option value="Toutes les périodes">Toutes les périodes</option>
                  <option value="Année">Année</option>
                  <option value="Mois">Mois</option>
                  <option value="Semaine">Semaine</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {objectifs.length === 0
            ? "Aucune ligne à afficher."
            : `${objectifs.length} objectif${objectifs.length > 1 ? "s" : ""} — recherche et filtres ci-dessus.`}
        </p>
      </div>

      <div className="overflow-x-auto">
        {isDatabaseEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
              <Target className="h-7 w-7" strokeWidth={1.25} aria-hidden />
            </div>
            <p className="text-base font-semibold text-zinc-800">Tableau vide</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Les objectifs définis dans les cartes ci-dessus apparaissent aussi ici. Ajoutez un objectif avec{" "}
              <span className="font-medium text-zinc-700">Nouvel objectif</span>.
            </p>
          </div>
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <p className="text-base font-medium text-zinc-800">Aucun résultat</p>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Ajustez la recherche ou les filtres type / période.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 text-sm font-medium text-[#6C5DD3] underline-offset-4 hover:underline"
            >
              Réinitialiser recherche et filtres
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200/90 bg-zinc-50/50">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Libellé
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Type
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Période
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cible
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Début
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Fin
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredObjectifs.map((objectif) => (
                <tr
                  key={objectif.id}
                  className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-[#6C5DD3]/[0.04]"
                >
                  <td className="p-4">
                    <span className="text-sm font-medium text-zinc-800">{objectif.libelle}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(objectif.type)}`}
                    >
                      {objectif.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-600">
                      {periodeLabelFr(normalizeObjectifPeriode(objectif.periode))}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium tabular-nums text-zinc-800">
                      {objectif.objectif.toLocaleString("fr-FR")}
                      {objectif.type === "Financier" ? " €" : ""}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm tabular-nums text-zinc-600">{objectif.dateDebut}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm tabular-nums text-zinc-600">{objectif.dateFin}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(objectif)}
                        className="p-2 text-zinc-500 transition-colors hover:text-[#6C5DD3]"
                        aria-label="Modifier"
                      >
                        <FaEllipsisV className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(objectif.id)}
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
