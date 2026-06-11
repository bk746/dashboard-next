"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import { FolderKanban } from "lucide-react";
import type { Projet } from "@/app/types";
import {
  dealsFloatingCard,
  dealsInputClass,
  dealsSegmentedBar,
  dealsTabActive,
  dealsTabInactive,
} from "@/app/deals-projets/dealsProjetsUi";

interface ProjetsTableProps {
  projets: Projet[];
  onDelete: (id: string) => void;
  onEdit: (projet: Projet) => void;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDateFin(dateStr: string): Date | null {
  if (!dateStr?.trim()) return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

type Urgency = "retard" | "urgent" | "semaine" | "mois" | "plus" | "sans";

function getEcheanceInfo(dateFinStr: string): {
  urgency: Urgency;
  badgeLabel: string;
  detail: string;
  dateFin: Date | null;
} {
  const dateFin = parseDateFin(dateFinStr);
  if (!dateFin) {
    return { urgency: "sans", badgeLabel: "Sans date", detail: "", dateFin: null };
  }
  const today = startOfDay(new Date());
  const end = startOfDay(dateFin);
  const diffDays = Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return {
      urgency: "retard",
      badgeLabel: "En retard",
      detail: `${Math.abs(diffDays)} j.`,
      dateFin,
    };
  }
  if (diffDays === 0) {
    return { urgency: "urgent", badgeLabel: "Aujourd'hui", detail: "J", dateFin };
  }
  if (diffDays <= 7) {
    return { urgency: "urgent", badgeLabel: "Urgent", detail: `dans ${diffDays} j.`, dateFin };
  }
  if (diffDays <= 14) {
    return { urgency: "semaine", badgeLabel: "Cette semaine", detail: `dans ${diffDays} j.`, dateFin };
  }
  if (diffDays <= 31) {
    return { urgency: "mois", badgeLabel: "Ce mois", detail: `dans ${diffDays} j.`, dateFin };
  }
  return { urgency: "plus", badgeLabel: "Plus tard", detail: `dans ${diffDays} j.`, dateFin };
}

function urgencyBadgeClass(u: Urgency): string {
  switch (u) {
    case "retard":
      return "bg-rose-500/15 text-rose-800";
    case "urgent":
      return "bg-orange-500/15 text-orange-800";
    case "semaine":
      return "bg-amber-500/15 text-amber-900";
    case "mois":
      return "bg-emerald-500/12 text-emerald-800";
    case "plus":
      return "bg-zinc-200/90 text-zinc-600";
    default:
      return "bg-zinc-100 text-zinc-500";
  }
}

function sortProjetsForSuivi(list: Projet[]): Projet[] {
  const today = startOfDay(new Date()).getTime();
  return [...list].sort((a, b) => {
    const da = parseDateFin(a.dateFin);
    const db = parseDateFin(b.dateFin);
    const ta = da ? da.getTime() : NaN;
    const tb = db ? db.getTime() : NaN;

    const tier = (t: number) => {
      if (Number.isNaN(t)) return 2;
      return t < today ? 0 : 1;
    };
    const tierA = tier(ta);
    const tierB = tier(tb);
    if (tierA !== tierB) return tierA - tierB;
    if (tierA === 2 && tierB === 2) return a.nom.localeCompare(b.nom, "fr");
    if (tierA === 0 && tierB === 0) return ta - tb;
    return ta - tb;
  });
}

export default function ProjetsTable({ projets, onDelete, onEdit }: ProjetsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");
  const [vueScope, setVueScope] = useState<"encours" | "tous">("encours");

  useEffect(() => {
    if (vueScope === "encours" && statusFilter === "Terminé") {
      setStatusFilter("Tous les statuts");
    }
  }, [vueScope, statusFilter]);

  const projetsEnCoursCount = useMemo(() => projets.filter((p) => p.statut !== "Terminé").length, [projets]);

  const filteredProjets = useMemo(() => {
    let list = projets;
    if (vueScope === "encours") {
      list = list.filter((p) => p.statut !== "Terminé");
    }
    list = list.filter((projet) => {
      const matchesSearch =
        projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projet.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projet.responsable.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "Tous les statuts" || projet.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortProjetsForSuivi(list);
  }, [projets, searchTerm, statusFilter, vueScope]);

  const isFilteredEmpty = projets.length > 0 && filteredProjets.length === 0;
  const isDatabaseEmpty = projets.length === 0;
  const onlyTermines =
    projets.length > 0 &&
    projets.every((p) => p.statut === "Terminé") &&
    vueScope === "encours" &&
    !searchTerm &&
    statusFilter === "Tous les statuts";

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Actif":
        return "bg-emerald-500/12 text-emerald-800";
      case "Prospect":
        return "bg-amber-500/12 text-amber-800";
      case "Terminé":
        return "bg-zinc-200/90 text-zinc-600";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Tous les statuts");
    setVueScope("encours");
  };

  return (
    <div className={dealsFloatingCard}>
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:px-6">
        <p className="mb-3 text-sm font-semibold text-zinc-900">Suivi des projets</p>
        <div className="flex flex-col gap-4">
          <div className={dealsSegmentedBar} role="tablist" aria-label="Portée de la liste">
            <button
              type="button"
              role="tab"
              aria-selected={vueScope === "encours"}
              onClick={() => setVueScope("encours")}
              className={vueScope === "encours" ? dealsTabActive : dealsTabInactive}
            >
              En cours
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vueScope === "tous"}
              onClick={() => setVueScope("tous")}
              className={vueScope === "tous" ? dealsTabActive : dealsTabInactive}
            >
              Tous
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <label htmlFor="projets-search" className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Rechercher
                </label>
                <div className="relative">
                  <FaSearch
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
                    aria-hidden
                  />
                  <input
                    id="projets-search"
                    type="search"
                    autoComplete="off"
                    placeholder="Nom, entreprise ou responsable…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${dealsInputClass} pl-10`}
                  />
                </div>
              </div>
              <div className="w-full shrink-0 lg:w-52">
                <label htmlFor="projets-filter-statut" className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Statut
                </label>
                <div className="relative">
                  <select
                    id="projets-filter-statut"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`${dealsInputClass} appearance-none cursor-pointer pr-9`}
                  >
                    <option value="Tous les statuts">Tous les statuts</option>
                    <option value="Actif">Actif</option>
                    <option value="Prospect">Prospect</option>
                    {vueScope === "tous" && <option value="Terminé">Terminé</option>}
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
                </div>
              </div>
            </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {projets.length === 0 ? (
            "Aucun projet."
          ) : (
            <>
              {projetsEnCoursCount} en cours sur {projets.length} · tri par échéance ·{" "}
              <Link href="/finance" className="font-medium text-[#6C5DD3] hover:underline">
                Finance
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="overflow-x-auto">
          {isDatabaseEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
                <FolderKanban className="h-7 w-7" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800">Aucun projet enregistré</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Créez un projet avec <span className="font-medium text-zinc-700">Nouveau projet</span> — vous pourrez lier une facture pour préremplir montant et entreprise.
              </p>
            </div>
          ) : onlyTermines ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucun projet en cours</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Tous vos projets sont au statut <span className="font-medium text-zinc-700">Terminé</span>. Passez à la vue « Tous » pour les consulter, ou créez un nouveau deal.
              </p>
              <button
                type="button"
                onClick={() => setVueScope("tous")}
                className="mt-5 text-sm font-medium text-[#6C5DD3] underline-offset-4 hover:underline"
              >
                Afficher tous les projets
              </button>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Aucun projet ne correspond à votre recherche ou au filtre de statut.
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
            <>
              {/* Mobile : cartes */}
              <div className="md:hidden divide-y divide-zinc-100">
                {filteredProjets.map((projet) => {
                  const ech = getEcheanceInfo(projet.dateFin);
                  return (
                    <div key={projet.id} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900">{projet.nom}</p>
                          <p className="text-sm text-zinc-600">{projet.entreprise}</p>
                        </div>
                        <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatutBadgeColor(projet.statut)}`}>
                          {projet.statut}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyBadgeClass(ech.urgency)}`}>
                          {ech.badgeLabel}
                        </span>
                        {ech.detail ? (
                          <span className="text-xs tabular-nums text-zinc-500">{ech.detail}</span>
                        ) : null}
                        <span className="text-xs text-zinc-500">Fin {projet.dateFin || "—"}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium tabular-nums text-zinc-800">
                        {projet.valeur.toLocaleString("fr-FR")} €
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{projet.responsable}</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(projet)}
                          className="text-sm font-medium text-[#6C5DD3]"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(projet.id)}
                          className="text-sm text-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop : tableau */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="border-b border-zinc-200/90 bg-zinc-50/50">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Projet
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Entreprise
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Statut
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Valeur
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Début
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Fin
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Échéance
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Responsable
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Commentaire
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjets.map((projet) => {
                    const ech = getEcheanceInfo(projet.dateFin);
                    return (
                      <tr
                        key={projet.id}
                        className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-[#6C5DD3]/[0.04]"
                      >
                        <td className="p-4">
                          <span className="text-sm font-medium text-zinc-800">{projet.nom}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-zinc-700">{projet.entreprise}</span>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(projet.statut)}`}>
                            {projet.statut}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium tabular-nums text-zinc-800">
                            {projet.valeur.toLocaleString("fr-FR")} €
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm tabular-nums text-zinc-600">{projet.dateDebut}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm tabular-nums text-zinc-600">{projet.dateFin}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyBadgeClass(ech.urgency)}`}>
                              {ech.badgeLabel}
                            </span>
                            {ech.detail ? (
                              <span className="text-xs tabular-nums text-zinc-500">{ech.detail}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-zinc-700">{projet.responsable}</span>
                        </td>
                        <td className="p-4">
                          <span className="block max-w-[200px] truncate text-sm text-zinc-600" title={projet.commentaire || ""}>
                            {projet.commentaire || "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(projet)}
                              className="p-2 text-zinc-500 transition-colors hover:text-zinc-800"
                              aria-label="Modifier"
                            >
                              <FaEllipsisV className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(projet.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
      </div>
    </div>
  );
}
