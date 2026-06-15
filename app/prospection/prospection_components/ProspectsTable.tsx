"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  MinusSquare,
  Pencil,
  Search,
  SlidersHorizontal,
  Square,
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
import SecureConfirmDialog, { type SecureConfirmRequest } from "@/components/SecureConfirmDialog";
const floatingCard =
  "overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

const inputClass =
  "w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/15";

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
  onBulkDelete: (ids: string[]) => void;
  onBulkAuditFait: (ids: string[], fait: boolean) => void;
  onBulkReponse: (ids: string[], reponse: ProspectReponseClient) => void;
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
  onBulkDelete,
  onBulkAuditFait,
  onBulkReponse,
}: ProspectsTableProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filtrePriorite, setFiltrePriorite] = useState<FiltreProspection>("tous");
  const [filtreReponse, setFiltreReponse] = useState<FiltreReponseProspection>("tous");
  const [filtreEtape, setFiltreEtape] = useState<FiltreEtapeProspection>("tous");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [secureConfirm, setSecureConfirm] = useState<SecureConfirmRequest | null>(null);

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

  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selectedCount = selectedIds.size;
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someFilteredSelected =
    filtered.some((p) => selectedIds.has(p.id)) && !allFilteredSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedIdsArray = useMemo(() => [...selectedIds], [selectedIds]);

  const runBulkDelete = () => {
    if (selectedCount === 0) return;
    const ids = selectedIdsArray;
    setSecureConfirm({
      title: selectedCount === 1 ? "Supprimer le prospect" : "Supprimer les prospects",
      message:
        selectedCount === 1
          ? "Confirmez la suppression de ce prospect. Cette action est irréversible."
          : `Confirmez la suppression de ${selectedCount} prospects. Cette action est irréversible.`,
      onConfirm: () => {
        onBulkDelete(ids);
        clearSelection();
      },
    });
  };

  const requestDeleteOne = (id: string, entreprise: string) => {
    setSecureConfirm({
      title: "Supprimer le prospect",
      message: `Supprimer « ${entreprise} » ? Cette action est irréversible.`,
      onConfirm: () => onDelete(id),
    });
  };

  const runBulkAuditFait = (fait: boolean) => {
    if (selectedCount === 0) return;
    onBulkAuditFait(selectedIdsArray, fait);
    clearSelection();
  };

  const runBulkReponse = (reponse: ProspectReponseClient) => {
    if (selectedCount === 0) return;
    onBulkReponse(selectedIdsArray, reponse);
    clearSelection();
  };

  return (
    <>
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
                  ? "border-transparent bg-[#007AFF]/10 text-[#007AFF]"
                  : "border-transparent bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70"
              }`}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filtres avancés
              {hasAdvancedActive ? (
                <span className="ml-0.5 rounded-full bg-[#007AFF] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
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

        {filtered.length > 0 ? (
          <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 sm:text-sm"
                aria-pressed={allFilteredSelected}
              >
                {allFilteredSelected ? (
                  <CheckSquare className="h-4 w-4 text-[#007AFF]" aria-hidden />
                ) : someFilteredSelected ? (
                  <MinusSquare className="h-4 w-4 text-[#007AFF]" aria-hidden />
                ) : (
                  <Square className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
                {allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"}
                <span className="text-zinc-400">({filtered.length})</span>
              </button>
              {selectedCount > 0 ? (
                <span className="text-xs font-medium text-[#007AFF] sm:text-sm">
                  {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>

            {selectedCount > 0 ? (
              <div
                className="flex flex-wrap items-center gap-2"
                role="toolbar"
                aria-label="Actions sur la sélection"
              >
                <button
                  type="button"
                  onClick={runBulkDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 sm:text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Supprimer ({selectedCount})
                </button>
                <button
                  type="button"
                  onClick={() => runBulkAuditFait(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 sm:text-sm"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Audit fait
                </button>
                <button
                  type="button"
                  onClick={() => runBulkReponse("valide")}
                  className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 hover:bg-emerald-100 sm:text-sm"
                >
                  Validé
                </button>
                <button
                  type="button"
                  onClick={() => runBulkReponse("refuse")}
                  className="inline-flex items-center rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/80 hover:bg-rose-100 sm:text-sm"
                >
                  Refusé
                </button>
                <button
                  type="button"
                  onClick={() => runBulkReponse("en_attente")}
                  className="inline-flex items-center rounded-xl bg-[#007AFF]/10 px-3 py-2 text-xs font-semibold text-[#007AFF] hover:bg-[#007AFF]/15 sm:text-sm"
                >
                  En attente
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 sm:text-sm"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Annuler
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
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
        <ul
          className={`grid grid-cols-1 gap-3 p-4 sm:gap-4 sm:p-6 ${selectedCount > 0 ? "pb-28 md:pb-6" : ""}`}
        >
          {filtered.map((p) => (
            <li key={p.id}>
              <ProspectCard
                prospect={p}
                selected={selectedIds.has(p.id)}
                onToggleSelect={() => toggleSelect(p.id)}
                onEdit={onEdit}
                onDelete={requestDeleteOne}
                onReponseChange={onReponseChange}
                onAuditFaitChange={onAuditFaitChange}
              />
            </li>
          ))}
        </ul>
      )}
      </div>

      {selectedCount > 0 ? (
        <BulkActionBar
          count={selectedCount}
          onAuditFait={() => runBulkAuditFait(true)}
          onRetirerAudit={() => runBulkAuditFait(false)}
          onValide={() => runBulkReponse("valide")}
          onRefuse={() => runBulkReponse("refuse")}
          onEnAttente={() => runBulkReponse("en_attente")}
          onDelete={runBulkDelete}
          onClear={clearSelection}
        />
      ) : null}

      <SecureConfirmDialog request={secureConfirm} onClose={() => setSecureConfirm(null)} />
    </>
  );
}

interface BulkActionBarProps {
  count: number;
  onAuditFait: () => void;
  onRetirerAudit: () => void;
  onValide: () => void;
  onRefuse: () => void;
  onEnAttente: () => void;
  onDelete: () => void;
  onClear: () => void;
}

function BulkActionBar({
  count,
  onAuditFait,
  onRetirerAudit,
  onValide,
  onRefuse,
  onEnAttente,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  const bulkBtn =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm";

  return (
    <div
      className="fixed bottom-[max(5.25rem,calc(4.25rem+env(safe-area-inset-bottom)))] left-0 right-0 z-[55] border-t border-zinc-200/80 bg-white/95 px-3 py-3 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md sm:px-6 md:bottom-0 md:left-[104px] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="toolbar"
      aria-label="Actions groupées"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-zinc-900">
          {count} prospect{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
          <button
            type="button"
            onClick={onDelete}
            className={`${bulkBtn} bg-rose-600 text-white hover:bg-rose-700`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Supprimer
          </button>
          <button
            type="button"
            onClick={onAuditFait}
            className={`${bulkBtn} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Audit fait
          </button>
          <button
            type="button"
            onClick={onRetirerAudit}
            className={`${bulkBtn} bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80`}
          >
            Retirer audit
          </button>
          <button
            type="button"
            onClick={onValide}
            className={`${bulkBtn} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 hover:bg-emerald-100`}
          >
            Validé
          </button>
          <button
            type="button"
            onClick={onRefuse}
            className={`${bulkBtn} bg-rose-50 text-rose-800 ring-1 ring-rose-200/80 hover:bg-rose-100`}
          >
            Refusé
          </button>
          <button
            type="button"
            onClick={onEnAttente}
            className={`${bulkBtn} bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/15`}
          >
            En attente
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`${bulkBtn} text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800`}
            aria-label="Annuler la sélection"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProspectCardProps {
  prospect: Prospect;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: (p: Prospect) => void;
  onDelete: (id: string, entreprise: string) => void;
  onReponseChange: (p: Prospect, reponse: ProspectReponseClient) => void;
  onAuditFaitChange: (p: Prospect, fait: boolean) => void;
}

function ProspectCard({
  prospect: p,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onReponseChange,
  onAuditFaitChange,
}: ProspectCardProps) {
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
            avatar: "bg-[#007AFF]/10 text-[#007AFF]",
            link: "text-[#007AFF] hover:text-[#0066D6]",
            segmentWrap: "bg-zinc-100/80",
            editHover: "hover:bg-[#007AFF]/10 hover:text-[#007AFF]",
          };

  return (
    <article
      className={`group rounded-2xl border-0 p-4 transition-all duration-200 hover:-translate-y-0.5 sm:p-5 ${
        selected ? "ring-2 ring-[#007AFF]/40 ring-offset-2 ring-offset-white " : ""
      }${cardTheme.surface}`}
      aria-label={`Prospect ${p.entreprise}`}
      data-selected={selected ? true : undefined}
    >
      <div className="flex flex-col gap-4">
        {/* Bandeau haut : identité + étape */}
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSelect}
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              selected
                ? "bg-[#007AFF]/15 text-[#007AFF]"
                : "bg-zinc-100/80 text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-600"
            }`}
            aria-label={selected ? `Désélectionner ${p.entreprise}` : `Sélectionner ${p.entreprise}`}
            aria-pressed={selected}
          >
            {selected ? (
              <CheckSquare className="h-5 w-5" aria-hidden />
            ) : (
              <Square className="h-5 w-5" aria-hidden />
            )}
          </button>

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
                <span className="inline-flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-2.5 py-1 text-xs font-medium text-[#007AFF]">
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
              onClick={() => onDelete(p.id, p.entreprise)}
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
              onClick={() => onDelete(p.id, p.entreprise)}
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
