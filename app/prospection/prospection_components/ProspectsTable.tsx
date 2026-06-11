"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ExternalLink,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import type { Prospect, ProspectEtapeContact, ProspectReponseClient } from "@/app/types";
import {
  auditPasEncoreEnvoye,
  auditPersonnaliseFait,
  besoinRelance,
  dateEffectiveProchaineRelance,
  dateEtapeEnCours,
  formatDateISOFr,
  ETAPES_CONTACT,
  prospectSiteHref,
} from "@/app/prospection/prospection_utils";
import { prospectMatchesSearch } from "@/app/prospection/prospectionSearch";
const floatingCard =
  "overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

const inputClass =
  "w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/15";

export type FiltreProspection =
  | "tous"
  | "urgent"
  | "audit_a_envoyer"
  | "audit_fait"
  | "relance";

/** Filtre sur la réponse client (combinable avec étape et filtre relance). */
export type FiltreReponseProspection = "tous" | ProspectReponseClient;

/** Filtre sur l’étape du pipeline (combinable). */
export type FiltreEtapeProspection = "tous" | ProspectEtapeContact;

interface ProspectsTableProps {
  prospects: Prospect[];
  onEdit: (p: Prospect) => void;
  onDelete: (id: string) => void;
  onReponseChange: (p: Prospect, reponse: ProspectReponseClient) => void;
  onAuditFaitChange: (p: Prospect, fait: boolean) => void;
}

function libelleEtape(value: string) {
  return ETAPES_CONTACT.find((s) => s.value === value);
}

export default function ProspectsTable({
  prospects,
  onEdit,
  onDelete,
  onReponseChange,
  onAuditFaitChange,
}: ProspectsTableProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filtrePriorite, setFiltrePriorite] = useState<FiltreProspection>("tous");
  const [filtreReponse, setFiltreReponse] = useState<FiltreReponseProspection>("tous");
  const [filtreEtape, setFiltreEtape] = useState<FiltreEtapeProspection>("tous");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const searchActive = deferredSearch.trim().length > 0;
  const searchPending = search !== deferredSearch;

  const filtered = useMemo(() => {
    let list = [...prospects];

    if (searchActive) {
      list = list.filter((p) => prospectMatchesSearch(p, deferredSearch));
    } else {
      switch (filtrePriorite) {
        case "urgent":
          list = list.filter((p) => !!p.urgent);
          break;
        case "audit_a_envoyer":
          list = list.filter((p) => auditPasEncoreEnvoye(p));
          break;
        case "relance":
          list = list.filter((p) => besoinRelance(p));
          break;
        case "audit_fait":
          list = list.filter((p) => auditPersonnaliseFait(p));
          break;
        default:
          break;
      }
    }

    if (filtreReponse !== "tous") {
      list = list.filter((p) => (p.reponseClient ?? "en_attente") === filtreReponse);
    }
    if (filtreEtape !== "tous") {
      list = list.filter((p) => p.etapeContact === filtreEtape);
    }
    list.sort((a, b) => a.entreprise.localeCompare(b.entreprise, "fr"));
    return list;
  }, [prospects, deferredSearch, searchActive, filtrePriorite, filtreReponse, filtreEtape]);

  const counts = useMemo(() => {
    return {
      tous: prospects.length,
      urgent: prospects.filter((p) => !!p.urgent).length,
      audit_a_envoyer: prospects.filter((p) => auditPasEncoreEnvoye(p)).length,
      audit_fait: prospects.filter((p) => auditPersonnaliseFait(p)).length,
      relance: prospects.filter((p) => besoinRelance(p)).length,
    };
  }, [prospects]);

  const QUICK_FILTERS: { value: FiltreProspection; label: string; count: number }[] = [
    { value: "tous", label: "Tous", count: counts.tous },
    { value: "relance", label: "À relancer", count: counts.relance },
    { value: "audit_a_envoyer", label: "Audit à faire", count: counts.audit_a_envoyer },
    { value: "audit_fait", label: "Audit fait", count: counts.audit_fait },
    { value: "urgent", label: "Urgent", count: counts.urgent },
  ];

  const REPONSE_FILTRES: { value: FiltreReponseProspection; label: string }[] = [
    { value: "tous", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "valide", label: "Validé" },
    { value: "refuse", label: "Refusé" },
  ];

  const hasAdvancedActive = filtreReponse !== "tous" || filtreEtape !== "tous";
  const resetAll = () => {
    setSearch("");
    setFiltrePriorite("tous");
    setFiltreReponse("tous");
    setFiltreEtape("tous");
  };
  const isFiltering =
    searchActive ||
    (!searchActive && filtrePriorite !== "tous") ||
    filtreReponse !== "tous" ||
    filtreEtape !== "tous";

  return (
    <div className={floatingCard}>
      <div className="border-b border-zinc-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Entreprise, contact, e-mail, site, tél… (sans majuscules)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} py-2.5 pl-10 pr-10 ${searchPending ? "opacity-80" : ""}`}
              aria-label="Rechercher un prospect"
              autoComplete="off"
              spellCheck={false}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Effacer la recherche"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                hasAdvancedActive || showAdvanced
                  ? "border-transparent bg-[#6C5DD3]/10 text-[#6C5DD3]"
                  : "border-transparent bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70"
              }`}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filtres avancés
              {hasAdvancedActive ? (
                <span className="ml-0.5 rounded-full bg-[#6C5DD3] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  •
                </span>
              ) : null}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {isFiltering ? (
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 sm:text-sm"
              >
                Réinitialiser
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Vues rapides">
          {QUICK_FILTERS.map(({ value, label, count }) => {
            const active = filtrePriorite === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFiltrePriorite(value)}
                className={`group/chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                  active
                    ? "border-transparent bg-zinc-900 text-white"
                    : "border-transparent bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70"
                }`}
              >
                {label}
                <span
                  className={`tabular-nums text-[11px] font-semibold ${
                    active ? "text-white/80" : "text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {showAdvanced ? (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-zinc-200/70 pt-4 sm:grid-cols-2">
            <div>
              <label htmlFor="filtre-reponse" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Réponse du prospect
              </label>
              <select
                id="filtre-reponse"
                value={filtreReponse}
                onChange={(e) => setFiltreReponse(e.target.value as FiltreReponseProspection)}
                className={`${inputClass} py-2 text-sm`}
              >
                {REPONSE_FILTRES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filtre-etape" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Statut du contact
              </label>
              <select
                id="filtre-etape"
                value={filtreEtape}
                onChange={(e) => setFiltreEtape(e.target.value as FiltreEtapeProspection)}
                className={`${inputClass} py-2 text-sm`}
              >
                <option value="tous">Toutes les étapes</option>
                {ETAPES_CONTACT.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-zinc-500">
          {searchActive ? (
            <>
              <span className="font-medium text-zinc-700">Recherche sur tous les prospects</span>
              {" · "}
            </>
          ) : null}
          {filtered.length} prospect{filtered.length > 1 ? "s" : ""} affiché
          {searchPending ? <span className="text-zinc-400"> …</span> : null}
          {isFiltering && !searchActive && filtered.length !== counts.tous ? (
            <span className="text-zinc-400"> / {counts.tous}</span>
          ) : null}
          {searchActive && filtered.length !== counts.tous ? (
            <span className="text-zinc-400"> / {counts.tous} au total</span>
          ) : null}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
            <Building2 className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="text-base font-semibold text-zinc-800">
            {prospects.length === 0
              ? "Aucun prospect pour l'instant"
              : "Aucun résultat pour ces filtres"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {prospects.length === 0
              ? "Créez une fiche avec le bouton Nouveau prospect en haut de la page."
              : "Élargissez la recherche ou changez les filtres."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 p-4 sm:gap-4 sm:p-6">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProspectCard
                prospect={p}
                onEdit={onEdit}
                onDelete={onDelete}
                onReponseChange={onReponseChange}
                onAuditFaitChange={onAuditFaitChange}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ProspectCardProps {
  prospect: Prospect;
  onEdit: (p: Prospect) => void;
  onDelete: (id: string) => void;
  onReponseChange: (p: Prospect, reponse: ProspectReponseClient) => void;
  onAuditFaitChange: (p: Prospect, fait: boolean) => void;
}

function ProspectCard({ prospect: p, onEdit, onDelete, onReponseChange, onAuditFaitChange }: ProspectCardProps) {
  const et = libelleEtape(p.etapeContact);
  const dateAction = dateEtapeEnCours(p);
  const rep = p.reponseClient ?? "en_attente";
  const siteHref = prospectSiteHref(p.siteWeb);
  const relanceDue = besoinRelance(p);
  const prochaineRelance = dateEffectiveProchaineRelance(p);
  const auditFait = auditPersonnaliseFait(p);

  const cardTheme =
    rep === "valide"
      ? {
          surface:
            "bg-emerald-100 hover:bg-emerald-100 hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.28)]",
          divider: "border-emerald-300/50",
          avatar: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25",
          link: "text-emerald-800 hover:text-emerald-950",
          segmentWrap: "bg-white/75 shadow-inner shadow-emerald-200/40",
          editHover: "hover:bg-emerald-600/10 hover:text-emerald-800",
        }
      : rep === "refuse"
        ? {
            surface:
              "bg-rose-100 hover:bg-rose-100 hover:shadow-[0_8px_24px_-12px_rgba(244,63,94,0.28)]",
            divider: "border-rose-300/50",
            avatar: "bg-rose-600 text-white shadow-sm shadow-rose-600/25",
            link: "text-rose-800 hover:text-rose-950",
            segmentWrap: "bg-white/75 shadow-inner shadow-rose-200/40",
            editHover: "hover:bg-rose-600/10 hover:text-rose-800",
          }
        : {
            surface: relanceDue
              ? "bg-amber-50/90 hover:bg-amber-50 ring-1 ring-amber-200/70 hover:shadow-[0_8px_24px_-12px_rgba(245,158,11,0.15)]"
              : "bg-zinc-50/80 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(108,93,211,0.12)]",
            divider: "border-zinc-200/60",
            avatar: "bg-[#6C5DD3]/10 text-[#6C5DD3]",
            link: "text-[#6C5DD3] hover:text-[#5B4CC7]",
            segmentWrap: "bg-zinc-100/80",
            editHover: "hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]",
          };

  return (
    <article
      className={`group rounded-2xl border-0 p-4 transition-all duration-200 hover:-translate-y-0.5 sm:p-5 ${cardTheme.surface}`}
      aria-label={`Prospect ${p.entreprise}`}
    >
      <div className="flex flex-col gap-4">
        {/* Bandeau haut : identité + étape */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold sm:h-12 sm:w-12 ${cardTheme.avatar}`}
            aria-hidden
          >
            {initiale(p.entreprise) ?? <Building2 className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900">
                {p.entreprise}
              </h3>
              {p.urgent ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-red-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700"
                  title="Urgent — site critique"
                >
                  Urgent
                </span>
              ) : null}
              {auditFait ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuditFaitChange(p, false);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 transition-colors hover:bg-rose-500/20"
                  title="Retirer le statut audit fait"
                >
                  Audit fait
                </button>
              ) : null}
            </div>

            {(p.contactNom || p.email) && (
              <p className="mt-0.5 truncate text-sm text-zinc-500">
                {[p.contactNom, p.email].filter(Boolean).join(" · ")}
              </p>
            )}
            {siteHref && (
              <a
                href={siteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`mt-1 inline-flex max-w-full items-center gap-1 text-xs font-medium hover:underline ${cardTheme.link}`}
              >
                <span className="truncate">{shortHost(siteHref)}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              </a>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {et ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                  <span aria-hidden>{et.emoji}</span>
                  {et.label}
                </span>
              ) : null}
              {dateAction ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs tabular-nums text-zinc-600">
                  <Calendar className="h-3 w-3 opacity-60" aria-hidden />
                  {new Date(dateAction + "T12:00:00").toLocaleDateString("fr-FR")}
                </span>
              ) : null}
              {relanceDue ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900">
                  <Bell className="h-3 w-3" aria-hidden />
                  À relancer
                </span>
              ) : prochaineRelance ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6C5DD3]/10 px-2.5 py-1 text-xs font-medium text-[#6C5DD3]">
                  Relance {formatDateISOFr(prochaineRelance)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Actions desktop (icon-only) */}
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => onEdit(p)}
              className={`rounded-lg p-2 text-zinc-500 transition-colors ${cardTheme.editHover}`}
              title="Modifier"
              aria-label={`Modifier ${p.entreprise}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer le prospect « ${p.entreprise} » ?`)) onDelete(p.id);
              }}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
              title="Supprimer"
              aria-label={`Supprimer ${p.entreprise}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bas : réponse + actions mobile */}
        <div
          className={`flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between ${cardTheme.divider}`}
        >
          <div
            className={`inline-flex w-full rounded-xl p-1 sm:max-w-sm ${cardTheme.segmentWrap}`}
            role="group"
            aria-label="Réponse client"
          >
            <ReponseSegment
              active={rep === "en_attente"}
              tone="neutral"
              onClick={(e) => {
                e.stopPropagation();
                onReponseChange(p, "en_attente");
              }}
              label="En attente"
            />
            <ReponseSegment
              active={rep === "valide"}
              tone="success"
              onClick={(e) => {
                e.stopPropagation();
                onReponseChange(p, "valide");
              }}
              label="Validé"
            />
            <ReponseSegment
              active={rep === "refuse"}
              tone="danger"
              onClick={(e) => {
                e.stopPropagation();
                onReponseChange(p, "refuse");
              }}
              label="Refusé"
            />
          </div>

          {/* Actions mobile */}
          <div className="flex items-center justify-end gap-1 sm:hidden">
            <button
              type="button"
              onClick={() => onEdit(p)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${cardTheme.editHover}`}
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer le prospect « ${p.entreprise} » ?`)) onDelete(p.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

interface ReponseSegmentProps {
  active: boolean;
  tone: "neutral" | "success" | "danger";
  onClick: (e: React.MouseEvent) => void;
  label: string;
}

function ReponseSegment({ active, tone, onClick, label }: ReponseSegmentProps) {
  const activeStyles = {
    neutral: "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80",
    success: "bg-emerald-600 text-white shadow-sm",
    danger: "bg-rose-600 text-white shadow-sm",
  };
  const inactiveStyles = {
    neutral: "text-zinc-600 hover:bg-white/80 hover:text-zinc-900",
    success: "text-zinc-600 hover:bg-white/80 hover:text-emerald-700",
    danger: "text-zinc-600 hover:bg-white/80 hover:text-rose-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
        active ? activeStyles[tone] : inactiveStyles[tone]
      }`}
    >
      {label}
    </button>
  );
}

function initiale(name: string): string | null {
  const cleaned = name.trim();
  if (!cleaned) return null;
  const words = cleaned.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
}

function shortHost(href: string): string {
  try {
    const u = new URL(href);
    return u.host.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return href;
  }
}
