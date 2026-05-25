"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, Users, Pencil, Trash2, Mail } from "lucide-react";
import type { Client } from "@/app/types";
import { normalizeAbonnement } from "@/lib/abonnement";

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
}

const floatingCard =
  "overflow-hidden rounded-3xl border-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_24px_-4px_rgba(0,0,0,0.10),0_16px_40px_-8px_rgba(0,0,0,0.06)]";

const inputClass =
  "w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/15";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function statutBadge(statut: string) {
  switch (statut) {
    case "Actif":
      return "bg-emerald-500/12 text-emerald-800";
    case "Inactif":
      return "bg-zinc-200/90 text-zinc-600";
    case "Prospect":
      return "bg-amber-500/12 text-amber-800";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

function abonnementBadge(abonnement?: string) {
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
      return "bg-zinc-100 text-zinc-600";
  }
}

export default function ClientsTable({ clients, onDelete, onEdit }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [abonnementFilter, setAbonnementFilter] = useState("Tous");
  const [sortKey, setSortKey] = useState<SortKey>("entreprise-asc");

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          client.entreprise.toLowerCase().includes(q) ||
          client.patron.toLowerCase().includes(q) ||
          client.email.toLowerCase().includes(q) ||
          (client.secteurActivite ?? "").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "Tous les statuts" || client.statut === statusFilter;
        const ab = normalizeAbonnement(client.abonnement);
        const matchesAbonnement = abonnementFilter === "Tous" || abonnementFilter === ab;
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

  return (
    <div className={floatingCard}>
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              id="clients-search"
              type="search"
              autoComplete="off"
              placeholder="Rechercher entreprise, contact, email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <select
                id="clients-filter-statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer pr-9`}
              >
                <option value="Tous les statuts">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Prospect">Prospect</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
            <div className="relative">
              <select
                id="clients-filter-abo"
                value={abonnementFilter}
                onChange={(e) => setAbonnementFilter(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer pr-9`}
              >
                <option value="Tous">Tous abonnements</option>
                <option value="Performance">Performance</option>
                <option value="Essentiel">Essentiel</option>
                <option value="Aucun">Aucun</option>
                <option value="Croissance">Croissance</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
            <div className="relative">
              <select
                id="clients-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className={`${inputClass} appearance-none cursor-pointer pr-9`}
              >
                <option value="entreprise-asc">Entreprise (A → Z)</option>
                <option value="entreprise-desc">Entreprise (Z → A)</option>
                <option value="ca-desc">CA (du plus haut)</option>
                <option value="ca-asc">CA (du plus bas)</option>
                <option value="activite-desc">Activité (récente)</option>
                <option value="activite-asc">Activité (ancienne)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
        </div>
        {clients.length > 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            {sortedClients.length} client{sortedClients.length > 1 ? "s" : ""} affiché
            {sortedClients.length !== clients.length ? ` sur ${clients.length}` : ""} · CA depuis{" "}
            <Link href="/finance" className="font-medium text-[#6C5DD3] hover:underline">
              Finance
            </Link>
          </p>
        ) : null}
      </div>

      {isDatabaseEmpty ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
            <Users className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="text-base font-semibold text-zinc-800">Aucun client pour l&apos;instant</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Ajoutez un client avec le bouton <span className="font-medium text-[#5E549E]">Nouveau client</span> en haut
            de la page.
          </p>
        </div>
      ) : isFilteredEmpty ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <p className="text-base font-medium text-zinc-800">Aucun résultat</p>
          <p className="mt-2 text-sm text-zinc-500">Aucun client ne correspond aux critères.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-sm font-semibold text-[#6C5DD3] hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-zinc-100 p-3 md:hidden">
            {sortedClients.map((client) => (
              <article key={client.id} className="rounded-2xl p-3 transition-colors hover:bg-zinc-50/80">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5DD3] to-[#5E549E] text-sm font-semibold text-white"
                    aria-hidden
                  >
                    {getInitials(client.entreprise)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">{client.entreprise}</p>
                    <p className="text-sm text-zinc-600">{client.patron}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">{client.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statutBadge(client.statut)}`}>
                        {client.statut}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${abonnementBadge(client.abonnement)}`}
                      >
                        {normalizeAbonnement(client.abonnement)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold tabular-nums text-[#5E549E]">
                      {(client.caTotal ?? 0).toLocaleString("fr-FR")} €
                    </p>
                    <p className="text-xs text-zinc-500">Activité {client.derniereActivite}</p>
                    <div className="mt-3 flex gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(client)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#6C5DD3]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(client.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/40">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Client
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Statut
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    CA total
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Abonnement
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Activité
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-[#6C5DD3]/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5DD3] to-[#5E549E] text-xs font-semibold text-white"
                          aria-hidden
                        >
                          {getInitials(client.entreprise)}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{client.entreprise}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-zinc-800">{client.patron}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Mail className="h-3 w-3 shrink-0" aria-hidden />
                        {client.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge(client.statut)}`}>
                        {client.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold tabular-nums text-[#5E549E]">
                        {(client.caTotal ?? 0).toLocaleString("fr-FR")} €
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${abonnementBadge(client.abonnement)}`}
                      >
                        {normalizeAbonnement(client.abonnement)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm tabular-nums text-zinc-600">{client.derniereActivite}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#6C5DD3] hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(client.id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
