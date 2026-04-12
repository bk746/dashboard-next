"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import { Target } from "lucide-react";
import type { Objectif } from "@/app/types";
import { normalizeObjectifPeriode, periodeLabelFr } from "@/app/lib/objectifsPeriod";
import { inputFieldClass, panelSurfaceClass, sectionIntroTitleClass, sectionIntroDescClass } from "@/app/components/appCardStyles";

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
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Client":
        return "bg-[#5b7fb8] text-white";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Liste détaillée</h2>
        <p className={sectionIntroDescClass}>
          {objectifs.length === 0
            ? "Aucune ligne à afficher."
            : `${objectifs.length} objectif${objectifs.length > 1 ? "s" : ""} — recherche, filtre par type et par période de suivi.`}
        </p>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        <div className="border-b border-zinc-100 bg-zinc-50/90 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="objectifs-search" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  id="objectifs-search"
                  type="search"
                  autoComplete="off"
                  placeholder="Libellé de l'objectif…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputFieldClass} pl-10 py-2.5 rounded-xl`}
                />
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:shrink-0 lg:grid-cols-2 lg:gap-4">
              <div className="w-full sm:min-w-[11rem]">
                <label htmlFor="objectifs-filter-type" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Type
                </label>
                <div className="relative">
                  <select
                    id="objectifs-filter-type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                  >
                    <option value="Tous les types">Tous les types</option>
                    <option value="Financier">Financier</option>
                    <option value="Client">Client</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
              <div className="w-full sm:min-w-[11rem]">
                <label htmlFor="objectifs-filter-periode" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Période
                </label>
                <div className="relative">
                  <select
                    id="objectifs-filter-periode"
                    value={periodeFilter}
                    onChange={(e) => setPeriodeFilter(e.target.value)}
                    className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                  >
                    <option value="Toutes les périodes">Toutes les périodes</option>
                    <option value="Année">Année</option>
                    <option value="Mois">Mois</option>
                    <option value="Semaine">Semaine</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-zinc-100 p-5 dark:bg-white/[0.06]">
                <Target className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Tableau vide</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Les objectifs définis dans les cartes ci-dessus apparaissent aussi ici pour une vue tabulaire. Ajoutez un objectif avec{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Nouvel objectif</span>.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Ajustez la recherche ou le filtre de type.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("Tous les types");
                  setPeriodeFilter("Toutes les périodes");
                }}
                className="mt-5 text-sm font-medium text-[#ED8600] underline-offset-4 hover:underline dark:text-[#8fa9c9]"
              >
                Réinitialiser recherche et filtre
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200/90 bg-zinc-50/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Libellé
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Type
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Période
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Cible
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Début
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Fin
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredObjectifs.map((objectif) => (
                  <tr
                    key={objectif.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="p-4">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{objectif.libelle}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(objectif.type)}`}>
                        {objectif.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{periodeLabelFr(normalizeObjectifPeriode(objectif.periode))}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                        {objectif.objectif.toLocaleString("fr-FR")}
                        {objectif.type === "Financier" ? " €" : ""}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{objectif.dateDebut}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{objectif.dateFin}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(objectif)}
                          className="p-2 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                          aria-label="Modifier"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(objectif.id)}
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
