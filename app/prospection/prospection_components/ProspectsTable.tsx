"use client";

import { useMemo, useState } from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import { Building2, Calendar, Pencil, Trash2 } from "lucide-react";
import type { Prospect, ProspectEtapeContact, ProspectReponseClient } from "@/app/types";
import {
  auditPasEncoreEnvoye,
  besoinRelanceAppelSemaine,
  besoinRelanceMailJ3,
  dateEtapeEnCours,
  estReponseClosee,
  ETAPES_CONTACT,
  prospectSiteHref,
} from "@/app/prospection/prospection_utils";
import { formLabelClass, inputFieldClass, panelSurfaceClass } from "@/app/components/appCardStyles";

export type FiltreProspection =
  | "tous"
  | "audit_a_envoyer"
  | "relance_mail"
  | "relance_appel"
  | "audit_actif";

/** Filtre sur la réponse client (combinable avec étape et filtre relance). */
export type FiltreReponseProspection = "tous" | ProspectReponseClient;

/** Filtre sur l’étape du pipeline (combinable). */
export type FiltreEtapeProspection = "tous" | ProspectEtapeContact;

interface ProspectsTableProps {
  prospects: Prospect[];
  onEdit: (p: Prospect) => void;
  onDelete: (id: string) => void;
  onReponseChange: (p: Prospect, reponse: ProspectReponseClient) => void;
}

function libelleEtape(value: string) {
  return ETAPES_CONTACT.find((s) => s.value === value);
}

export default function ProspectsTable({
  prospects,
  onEdit,
  onDelete,
  onReponseChange,
}: ProspectsTableProps) {
  const [search, setSearch] = useState("");
  const [filtrePriorite, setFiltrePriorite] = useState<FiltreProspection>("tous");
  const [filtreReponse, setFiltreReponse] = useState<FiltreReponseProspection>("tous");
  const [filtreEtape, setFiltreEtape] = useState<FiltreEtapeProspection>("tous");

  const filtered = useMemo(() => {
    let list = [...prospects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.entreprise.toLowerCase().includes(q) ||
          (p.contactNom ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q) ||
          (p.siteWeb ?? "").toLowerCase().includes(q)
      );
    }
    switch (filtrePriorite) {
      case "audit_a_envoyer":
        list = list.filter((p) => auditPasEncoreEnvoye(p));
        break;
      case "relance_mail":
        list = list.filter((p) => besoinRelanceMailJ3(p));
        break;
      case "relance_appel":
        list = list.filter((p) => besoinRelanceAppelSemaine(p));
        break;
      case "audit_actif":
        list = list.filter((p) => !!p.dateAuditPersoEnvoye && !estReponseClosee(p));
        break;
      default:
        break;
    }
    if (filtreReponse !== "tous") {
      list = list.filter((p) => (p.reponseClient ?? "en_attente") === filtreReponse);
    }
    if (filtreEtape !== "tous") {
      list = list.filter((p) => p.etapeContact === filtreEtape);
    }
    list.sort((a, b) => a.entreprise.localeCompare(b.entreprise, "fr"));
    return list;
  }, [prospects, search, filtrePriorite, filtreReponse, filtreEtape]);

  const counts = useMemo(() => {
    return {
      audit_a_envoyer: prospects.filter((p) => auditPasEncoreEnvoye(p)).length,
      relance_mail: prospects.filter((p) => besoinRelanceMailJ3(p)).length,
      relance_appel: prospects.filter((p) => besoinRelanceAppelSemaine(p)).length,
    };
  }, [prospects]);

  const segTrack =
    "inline-flex flex-wrap gap-1 rounded-2xl border border-zinc-200/90 bg-zinc-100/90 p-1 dark:border-white/[0.1] dark:bg-zinc-900/60";
  const segBtn =
    "rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 sm:text-sm";
  const segOff = "text-zinc-600 hover:bg-white/80 dark:text-zinc-300 dark:hover:bg-white/[0.08]";
  const segOn =
    "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-[#3d4f63] dark:text-white dark:ring-white/10";

  const REPONSE_FILTRES: { value: FiltreReponseProspection; label: string }[] = [
    { value: "tous", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "valide", label: "Validé" },
    { value: "refuse", label: "Refusé" },
  ];

  const filtreCardClass =
    "rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/80 shadow-sm dark:border-white/[0.08] dark:from-zinc-900/40 dark:to-zinc-950/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  return (
    <div className="space-y-4">
      <div className={`${filtreCardClass} p-4 sm:p-5 space-y-5`}>
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ED8600]/12 text-[#c26500] dark:bg-[#5b7fb8]/25 dark:text-[#a8c0e0]"
            aria-hidden
          >
            <FaSlidersH className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Filtrer la liste</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Combinez une <strong>vue priorité</strong> (relances à traiter), une <strong>réponse</strong> et une{" "}
              <strong>étape</strong> — tout s&apos;applique ensemble.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <label htmlFor="prospect-search" className={formLabelClass}>
              Recherche
            </label>
            <div className="relative">
              <FaSearch
                className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-zinc-400 text-sm"
                aria-hidden
              />
              <input
                id="prospect-search"
                type="search"
                placeholder="Nom d’entreprise, contact, e-mail…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputFieldClass} pl-9`}
              />
            </div>
          </div>
          <div className="w-full shrink-0 lg:max-w-sm">
            <label htmlFor="filtre-priorite" className={formLabelClass}>
              Vue priorité
            </label>
            <select
              id="filtre-priorite"
              value={filtrePriorite}
              onChange={(e) => setFiltrePriorite(e.target.value as FiltreProspection)}
              className={inputFieldClass}
            >
              <option value="tous">Toutes les fiches</option>
              <option value="audit_a_envoyer">
                Audits à dater (sans date d’envoi){counts.audit_a_envoyer ? ` — ${counts.audit_a_envoyer}` : ""}
              </option>
              <option value="relance_mail">
                Relance mail J+3 à faire{counts.relance_mail ? ` — ${counts.relance_mail}` : ""}
              </option>
              <option value="relance_appel">
                Relance appel (+7 j. après mail){counts.relance_appel ? ` — ${counts.relance_appel}` : ""}
              </option>
              <option value="audit_actif">Suivi audit en cours (pas clos)</option>
            </select>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              Raccourci vers les dossiers qui demandent une action — sans changer réponse ni étape.
            </p>
          </div>
        </div>

        <div className="space-y-3" aria-label="Filtres réponse et étape">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Réponse client
            </p>
            <div className={segTrack} role="group" aria-label="Filtrer par réponse">
              {REPONSE_FILTRES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFiltreReponse(value)}
                  className={`${segBtn} ${filtreReponse === value ? segOn : segOff}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Étape du pipeline
            </p>
            <div className={`${segTrack} gap-1.5`} role="group" aria-label="Filtrer par étape">
              <button
                type="button"
                onClick={() => setFiltreEtape("tous")}
                className={`${segBtn} ${filtreEtape === "tous" ? segOn : segOff}`}
              >
                Toutes
              </button>
              {ETAPES_CONTACT.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFiltreEtape(s.value)}
                  className={`${segBtn} inline-flex items-center gap-1.5 ${
                    filtreEtape === s.value ? segOn : segOff
                  }`}
                >
                  <span aria-hidden>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        <div className="border-b border-zinc-200/80 px-4 py-3 dark:border-white/[0.06] sm:px-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Prospects</h2>
            <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
              {filtered.length} dossier{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/40 px-6 py-14 text-center dark:border-white/[0.1] dark:bg-white/[0.02]">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" aria-hidden />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {prospects.length === 0
                  ? "Aucun prospect pour l’instant"
                  : "Aucun résultat pour ces filtres"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {prospects.length === 0
                  ? "Créez une fiche avec le bouton « Nouveau prospect »."
                  : "Élargissez la recherche ou changez les filtres."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((p) => {
                const et = libelleEtape(p.etapeContact);
                const dateAction = dateEtapeEnCours(p);
                const rep = p.reponseClient ?? "en_attente";
                const siteHref = prospectSiteHref(p.siteWeb);
                const cardTint =
                  rep === "valide"
                    ? "border-emerald-400/40 bg-gradient-to-br from-emerald-100/90 to-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:from-emerald-950/50 dark:to-[#12131a] dark:shadow-none"
                    : rep === "refuse"
                      ? "border-rose-400/40 bg-gradient-to-br from-rose-100/90 to-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:from-rose-950/45 dark:to-[#12131a] dark:shadow-none"
                      : "border-zinc-200/90 bg-white/80 dark:border-white/[0.08] dark:bg-[#12131a]/90";

                return (
                  <li key={p.id}>
                    <article
                      className={`group relative overflow-hidden rounded-2xl border p-4 transition-[box-shadow,transform,border-color] duration-200 sm:p-5 ${cardTint} hover:shadow-md dark:hover:border-white/[0.12]`}
                      aria-label={`Prospect ${p.entreprise}`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                                rep === "valide"
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                  : rep === "refuse"
                                    ? "bg-rose-500/15 text-rose-800 dark:text-rose-300"
                                    : "bg-[#ED8600]/12 text-[#b45309] dark:bg-[#5b7fb8]/20 dark:text-[#a8c0e0]"
                              }`}
                            >
                              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                <span className="truncate">{p.entreprise}</span>
                                {p.urgent ? (
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                                    title="Urgent — site critique"
                                    aria-label="Urgent — site critique"
                                  />
                                ) : null}
                              </h3>
                              {(p.contactNom || p.email) && (
                                <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                                  {[p.contactNom, p.email].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {siteHref && (
                                <p className="mt-1 min-w-0">
                                  <a
                                    href={siteHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block max-w-full truncate text-sm font-medium text-[#c26500] underline underline-offset-2 hover:text-[#a55500] dark:text-[#a8c0e0] dark:hover:text-[#c5d4ec]"
                                  >
                                    {siteHref}
                                  </a>
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/70 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-200">
                                  <span aria-hidden>{et?.emoji}</span>
                                  {et?.label}
                                </span>
                                {dateAction ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100/90 px-2.5 py-1 text-xs tabular-nums text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-300">
                                    <Calendar className="h-3.5 w-3.5 opacity-70" aria-hidden />
                                    {new Date(dateAction + "T12:00:00").toLocaleDateString("fr-FR")}
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-400">Pas de date</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex xl:flex-row xl:items-center">
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-200">
                              <span aria-hidden>{et?.emoji}</span>
                              {et?.label}
                            </span>
                            {dateAction ? (
                              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100/90 px-3 py-1.5 text-sm tabular-nums text-zinc-800 dark:bg-white/[0.08] dark:text-zinc-200">
                                <Calendar className="h-4 w-4 opacity-70" aria-hidden />
                                {new Date(dateAction + "T12:00:00").toLocaleDateString("fr-FR")}
                              </span>
                            ) : (
                              <span className="text-sm text-zinc-400">—</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
                          <div
                            className="inline-flex w-full max-w-full rounded-xl border border-zinc-200/90 bg-zinc-100/80 p-0.5 dark:border-white/[0.12] dark:bg-zinc-900/80 sm:max-w-lg"
                            role="group"
                            aria-label="Réponse client"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReponseChange(p, "en_attente");
                              }}
                              className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                                rep === "en_attente"
                                  ? "bg-zinc-300/95 text-zinc-900 shadow-sm ring-1 ring-zinc-400/40 dark:bg-zinc-600 dark:text-zinc-50 dark:ring-zinc-500/50"
                                  : "text-zinc-600 hover:bg-white/90 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200"
                              }`}
                            >
                              En attente
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReponseChange(p, "valide");
                              }}
                              className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                                rep === "valide"
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "text-zinc-600 hover:bg-white/90 hover:text-emerald-800 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-emerald-300"
                              }`}
                            >
                              Validé
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReponseChange(p, "refuse");
                              }}
                              className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                                rep === "refuse"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "text-zinc-600 hover:bg-white/90 hover:text-rose-800 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-rose-300"
                              }`}
                            >
                              Refusé
                            </button>
                          </div>

                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(p)}
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#c26500] transition-colors hover:bg-[#ED8600]/10 dark:text-[#a8c0e0] dark:hover:bg-white/[0.06]"
                            >
                              <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                              <span className="hidden sm:inline">Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Supprimer le prospect « ${p.entreprise} » ?`)) onDelete(p.id);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
