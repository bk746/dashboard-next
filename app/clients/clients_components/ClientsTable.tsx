"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FaEnvelope, FaSearch, FaChevronDown } from "react-icons/fa";
import { Users } from "lucide-react";
import type { Client } from "@/app/types";
import { normalizeAbonnement } from "@/lib/abonnement";
import { inputFieldClass, panelSurfaceClass, sectionIntroTitleClass, sectionIntroDescClass } from "@/app/components/appCardStyles";

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
}

function parseActivityTime(s: string): number {
  try {
    const d = new Date(s.split("/").reverse().join("-"));
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
}

type SortKey =
  | "entreprise-asc"
  | "entreprise-desc"
  | "ca-desc"
  | "ca-asc"
  | "activite-desc"
  | "activite-asc";

export default function ClientsTable({ clients, onDelete, onEdit }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");
  const [abonnementFilter, setAbonnementFilter] = useState<string>("Tous");
  const [sortKey, setSortKey] = useState<SortKey>("entreprise-asc");

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const matchesSearch =
          client.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.patron.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.secteurActivite ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "Tous les statuts" || client.statut === statusFilter;
        const ab = normalizeAbonnement(client.abonnement);
        const matchesAbonnement =
          abonnementFilter === "Tous" || abonnementFilter === ab;
        return matchesSearch && matchesStatus && matchesAbonnement;
      }),
    [clients, searchTerm, statusFilter, abonnementFilter]
  );

  const sortedClients = useMemo(() => {
    const copy = [...filteredClients];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "entreprise-asc":
          return a.entreprise.localeCompare(b.entreprise, "fr");
        case "entreprise-desc":
          return b.entreprise.localeCompare(a.entreprise, "fr");
        case "ca-desc":
          return (b.caTotal ?? 0) - (a.caTotal ?? 0);
        case "ca-asc":
          return (a.caTotal ?? 0) - (b.caTotal ?? 0);
        case "activite-desc":
          return parseActivityTime(b.derniereActivite) - parseActivityTime(a.derniereActivite);
        case "activite-asc":
          return parseActivityTime(a.derniereActivite) - parseActivityTime(b.derniereActivite);
        default:
          return 0;
      }
    });
    return copy;
  }, [filteredClients, sortKey]);

  const isFilteredEmpty = clients.length > 0 && filteredClients.length === 0;
  const isDatabaseEmpty = clients.length === 0;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Tous les statuts");
    setAbonnementFilter("Tous");
    setSortKey("entreprise-asc");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Actif":
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Inactif":
        return "bg-zinc-500 text-white";
      case "Prospect":
        return "bg-amber-600/90 text-white dark:bg-amber-500/75";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  const getAbonnementBadgeColor = (abonnement?: string) => {
    const a = normalizeAbonnement(abonnement);
    switch (a) {
      case "Croissance":
        return "bg-violet-600/90 text-white dark:bg-violet-500/80";
      case "Performance":
        return "bg-emerald-600/90 text-white dark:bg-emerald-500/80";
      case "Essentiel":
        return "bg-zinc-500 text-white";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Annuaire clients</h2>
        <p className={sectionIntroDescClass}>
          {clients.length === 0 ? (
            "Aucun client enregistré."
          ) : (
            <>
              {clients.length} client{clients.length > 1 ? "s" : ""} — recherche, filtres statut / abonnement, tri. Le CA
              total provient des factures payées (
              <Link href="/finance" className="font-medium text-[#ED8600] underline-offset-2 hover:underline dark:text-[#8fa9c9]">
                Finance
              </Link>
              ).
            </>
          )}
        </p>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        <div className="border-b border-zinc-100 bg-zinc-50/90 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] sm:px-5">
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <label htmlFor="clients-search" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  id="clients-search"
                  type="search"
                  autoComplete="off"
                  placeholder="Entreprise, contact, email ou secteur…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputFieldClass} pl-10 py-2.5 rounded-xl`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="min-w-0">
                <label htmlFor="clients-filter-statut" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Statut
                </label>
                <div className="relative">
                  <select
                    id="clients-filter-statut"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                  >
                    <option value="Tous les statuts">Tous les statuts</option>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Prospect">Prospect</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="clients-filter-abo" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Abonnement
                </label>
                <div className="relative">
                  <select
                    id="clients-filter-abo"
                    value={abonnementFilter}
                    onChange={(e) => setAbonnementFilter(e.target.value)}
                    className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                  >
                    <option value="Tous">Tous</option>
                    <option value="Essentiel">Essentiel</option>
                    <option value="Performance">Performance</option>
                    <option value="Croissance">Croissance</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
              <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                <label htmlFor="clients-sort" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    id="clients-sort"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className={`${inputFieldClass} w-full appearance-none cursor-pointer px-4 py-2.5 pr-9 text-sm rounded-xl`}
                  >
                    <option value="entreprise-asc">Entreprise (A → Z)</option>
                    <option value="entreprise-desc">Entreprise (Z → A)</option>
                    <option value="ca-desc">CA (du plus haut)</option>
                    <option value="ca-asc">CA (du plus bas)</option>
                    <option value="activite-desc">Dernière activité (plus récente)</option>
                    <option value="activite-asc">Dernière activité (plus ancienne)</option>
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
                <Users className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Aucun client pour l&apos;instant</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Ajoutez un client avec le bouton <span className="font-medium text-zinc-700 dark:text-zinc-300">Nouveau client</span> en haut de la page pour constituer votre annuaire.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucun résultat</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Aucun client ne correspond aux critères choisis.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 text-sm font-medium text-[#ED8600] underline-offset-4 hover:underline dark:text-[#8fa9c9]"
              >
                Réinitialiser recherche et filtres
              </button>
            </div>
          ) : (
            <>
              <div className="md:hidden divide-y divide-zinc-100 dark:divide-white/[0.06]">
                {sortedClients.map((client) => (
                  <div key={client.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ED8600]/90 text-sm font-semibold text-white dark:bg-[#5b7fb8]/90"
                        aria-hidden
                      >
                        {getInitials(client.entreprise)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{client.entreprise}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{client.patron}</p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{client.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatutBadgeColor(client.statut)}`}>
                            {client.statut}
                          </span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getAbonnementBadgeColor(client.abonnement)}`}>
                            Abo. {normalizeAbonnement(client.abonnement)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                          CA {(client.caTotal ?? 0).toLocaleString("fr-FR")} €
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Activité {client.derniereActivite}</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => onEdit(client)}
                            className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9]"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(client.id)}
                            className="text-sm text-red-600 dark:text-red-400"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <table className="hidden md:table w-full">
                <thead>
                  <tr className="border-b border-zinc-200/90 bg-zinc-50/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Client
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Contact
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Statut
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      CA total
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Abonnement
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Dernière activité
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ED8600]/90 text-sm font-semibold text-white dark:bg-[#5b7fb8]/90"
                            aria-hidden
                          >
                            {getInitials(client.entreprise)}
                          </div>
                          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{client.entreprise}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">{client.patron}</span>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-xs text-zinc-400" aria-hidden />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{client.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(client.statut)}`}>
                          {client.statut}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200" title="Somme des factures payées (Finance)">
                          {(client.caTotal ?? 0).toLocaleString("fr-FR")} €
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getAbonnementBadgeColor(client.abonnement)}`}>
                          {normalizeAbonnement(client.abonnement)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{client.derniereActivite}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onEdit(client)}
                            className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9] hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(client.id)}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
