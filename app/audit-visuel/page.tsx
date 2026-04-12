"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AuditVisuelRecord, Prospect } from "@/app/types";
import { createStandaloneAuditRecord, prospectAuditRecordId } from "@/app/audit-visuel/audit_visuel_utils";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  pageEyebrowClass,
  pageShellClass,
  pageSubtitleClass,
  pageTitleClass,
  primaryButtonClass,
  secondaryButtonClass,
  inputFieldClass,
  formLabelClass,
  panelSurfaceClass,
  overlayBackdropClass,
  overlayPanelNarrowClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
} from "@/app/components/appCardStyles";
import { prospectSiteHref } from "@/app/prospection/prospection_utils";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Layers,
  Plus,
  ScanEye,
  Search,
  Sparkles,
  Trash2,
  UserCircle2,
} from "lucide-react";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

function noteTone(score: number): string {
  if (score >= 75) return "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200 dark:ring-emerald-500/20";
  if (score >= 60) return "bg-amber-500/15 text-amber-900 ring-amber-400/30 dark:text-amber-200 dark:ring-amber-500/20";
  if (score >= 40) return "bg-orange-500/15 text-orange-900 ring-orange-400/25 dark:text-orange-200 dark:ring-orange-500/15";
  return "bg-rose-500/15 text-rose-900 ring-rose-400/25 dark:text-rose-200 dark:ring-rose-500/15";
}

export default function AuditVisuelListPage() {
  const router = useRouter();
  const [records, setRecords, ready] = useJsonBucket<AuditVisuelRecord[]>("audits-visuels", []);
  const [prospects, setProspects] = useJsonBucket<Prospect[]>("prospection", []);

  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "prospect" | "seul">("tous");
  const [showNew, setShowNew] = useState(false);
  const [newTitre, setNewTitre] = useState("");
  const [newSite, setNewSite] = useState("");
  const [newProspectId, setNewProspectId] = useState("");

  useEffect(() => {
    if (!ready) return;
    setRecords((list) => {
      const ids = new Set(list.map((a) => a.id));
      const extra: AuditVisuelRecord[] = [];
      for (const p of prospects) {
        if (!p.auditVisuel) continue;
        const id = prospectAuditRecordId(p.id);
        if (ids.has(id)) continue;
        const d = p.auditVisuel;
        extra.push({
          id,
          prospectId: p.id,
          titre: p.entreprise.trim() || "Sans nom",
          siteWeb: p.siteWeb?.trim() || undefined,
          dossier: d,
          createdAt: d.updatedAt,
          updatedAt: d.updatedAt,
        });
      }
      return extra.length ? [...list, ...extra] : list;
    });
  }, [ready, prospects, setRecords]);

  const sorted = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [records]);

  const filtered = useMemo(() => {
    let list = sorted;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.titre.toLowerCase().includes(q) ||
          (r.siteWeb ?? "").toLowerCase().includes(q) ||
          (r.prospectId && prospects.find((p) => p.id === r.prospectId)?.entreprise.toLowerCase().includes(q))
      );
    }
    if (filtre === "prospect") list = list.filter((r) => !!r.prospectId);
    if (filtre === "seul") list = list.filter((r) => !r.prospectId);
    return list;
  }, [sorted, search, filtre, prospects]);

  const kpis = useMemo(() => {
    const n = records.length;
    const avg =
      n > 0 ? Math.round(records.reduce((s, r) => s + r.dossier.generated.noteSur100, 0) / n) : 0;
    const linked = records.filter((r) => r.prospectId).length;
    return { n, avg, linked };
  }, [records]);

  const openNewModal = () => {
    setNewTitre("");
    setNewSite("");
    setNewProspectId("");
    setShowNew(true);
  };

  const createAudit = () => {
    if (newProspectId) {
      const existing = records.find((r) => r.id === prospectAuditRecordId(newProspectId));
      if (existing) {
        setShowNew(false);
        router.push(`/audit-visuel/${existing.id}`);
        return;
      }
      const p = prospects.find((x) => x.id === newProspectId);
      const titre = p?.entreprise.trim() || newTitre.trim() || "Sans titre";
      const row = createStandaloneAuditRecord(titre, {
        prospectId: newProspectId,
        siteWeb: newSite.trim() || p?.siteWeb,
      });
      setRecords((list) => [...list, row]);
      setShowNew(false);
      router.push(`/audit-visuel/${row.id}`);
      return;
    }
    const titre = newTitre.trim() || "Nouvel audit";
    const row = createStandaloneAuditRecord(titre, { siteWeb: newSite.trim() || undefined });
    setRecords((list) => [...list, row]);
    setShowNew(false);
    router.push(`/audit-visuel/${row.id}`);
  };

  const deleteOne = (id: string) => {
    if (!confirm("Supprimer cet audit de l’historique ? La fiche prospect sera aussi mise à jour si elle était liée."))
      return;
    const row = records.find((a) => a.id === id);
    const now = new Date().toISOString();
    if (row?.prospectId) {
      setProspects((ps) =>
        ps.map((p) =>
          p.id === row.prospectId ? { ...p, auditVisuel: undefined, updatedAt: now } : p
        )
      );
    }
    setRecords((list) => list.filter((a) => a.id !== id));
  };

  const prospectsSorted = useMemo(() => {
    return [...prospects].sort((a, b) => a.entreprise.localeCompare(b.entreprise, "fr"));
  }, [prospects]);

  return (
    <div className={`${pageShellClass} pb-16`}>
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-[#ED8600]/[0.12] via-white to-violet-500/[0.08] p-6 shadow-lg dark:border-white/[0.08] dark:from-[#ED8600]/[0.08] dark:via-[#12131a] dark:to-violet-950/30 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ED8600]/20 blur-3xl dark:bg-[#5b7fb8]/15" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className={pageEyebrowClass}>
                <span className="inline-flex items-center gap-2 text-[#b45309] dark:text-[#a8c0e0]">
                  <ScanEye className="h-4 w-4" aria-hidden />
                  Finance
                </span>
              </p>
              <h1 className={`${pageTitleClass} text-3xl sm:text-[28px]`}>Audits visuels</h1>
              <p className={`${pageSubtitleClass} mt-2 max-w-xl`}>
                Historique centralisé : rouvrez un audit existant, créez-en un neuf (avec ou sans fiche prospect), et
                retrouvez les notes & textes générés en un clic.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-200">
                  <Layers className="h-3.5 w-3.5 text-[#ED8600] dark:text-[#8fa9c9]" aria-hidden />
                  Pondération par secteur
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-200">
                  <UserCircle2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" aria-hidden />
                  Liaison prospect optionnelle
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={openNewModal}
                className={`${primaryButtonClass} inline-flex items-center justify-center gap-2 shadow-lg shadow-[#ED8600]/20 dark:shadow-[#5b7fb8]/20`}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Nouvel audit
              </button>
              <div className="flex flex-wrap gap-2">
                <Link href="/finance" className={`${secondaryButtonClass} inline-flex justify-center`}>
                  Finance
                </Link>
                <Link href="/estimation" className={`${secondaryButtonClass} inline-flex justify-center`}>
                  Estimation
                </Link>
                <Link href="/prospection" className={`${secondaryButtonClass} inline-flex justify-center`}>
                  Prospection
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!ready ? (
          <p className="text-sm text-zinc-500">Chargement de vos audits…</p>
        ) : (
          <>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12131a]/90">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ED8600]/12 text-[#b45309] dark:bg-[#5b7fb8]/20 dark:text-[#a8c0e0]">
                    <FolderOpen className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Audits enregistrés
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{kpis.n}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12131a]/90">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-800 dark:text-violet-300">
                    <BarChart3 className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Note moyenne
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {kpis.n ? `${kpis.avg}` : "—"}
                      <span className="ml-1 text-sm font-semibold text-zinc-400">/100</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12131a]/90">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-800 dark:text-emerald-300">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Liés à un prospect
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{kpis.linked}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${panelSurfaceClass} mb-6 p-4 sm:p-5`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1">
                  <label htmlFor="audit-search" className={formLabelClass}>
                    Rechercher
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                      aria-hidden
                    />
                    <input
                      id="audit-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Entreprise, site…"
                      className={`${inputFieldClass} pl-10`}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["tous", "Tous"],
                      ["prospect", "Avec prospect"],
                      ["seul", "Sans prospect"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFiltre(v)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        filtre === v
                          ? "bg-[#ED8600] text-white shadow-sm dark:bg-[#5b7fb8]"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div
                className={`${panelSurfaceClass} flex flex-col items-center px-6 py-16 text-center`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.06]">
                  <ClipboardList className="h-8 w-8 text-zinc-400" aria-hidden />
                </div>
                <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  {records.length === 0 ? "Aucun audit pour l’instant" : "Aucun résultat"}
                </p>
                <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  {records.length === 0
                    ? "Créez un premier audit pour ce site ou liez-le à un prospect depuis le formulaire Prospection."
                    : "Élargissez la recherche ou changez le filtre."}
                </p>
                <button
                  type="button"
                  onClick={openNewModal}
                  className={`${primaryButtonClass} mt-6 inline-flex items-center gap-2`}
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Créer un audit
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((r) => {
                  const score = r.dossier.generated.noteSur100;
                  const hrefSite = prospectSiteHref(r.siteWeb);
                  const prospectRow = r.prospectId ? prospects.find((p) => p.id === r.prospectId) : undefined;
                  return (
                    <li key={r.id}>
                      <div
                        className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-zinc-50/90 p-4 shadow-sm transition hover:border-[#ED8600]/35 hover:shadow-md dark:border-white/[0.08] dark:from-[#12131a] dark:to-[#0f1016] dark:hover:border-[#8fa9c9]/30"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex flex-1 gap-4">
                            <span
                              className={`inline-flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl font-bold tabular-nums ring-2 ring-inset ${noteTone(score)}`}
                            >
                              <span className="text-lg leading-none">{score}</span>
                              <span className="text-[9px] font-semibold uppercase opacity-80">/100</span>
                            </span>
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                                {r.titre}
                              </h2>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="tabular-nums">
                                  Maj. {dateFmt.format(new Date(r.updatedAt))}
                                </span>
                                {r.prospectId ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                                    <UserCircle2 className="h-3 w-3" aria-hidden />
                                    Prospect
                                    {prospectRow ? ` · ${prospectRow.entreprise}` : ""}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/80 px-2 py-0.5 font-medium text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-300">
                                    Audit autonome
                                  </span>
                                )}
                              </div>
                              {hrefSite ? (
                                <a
                                  href={hrefSite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-[#c26500] underline-offset-2 hover:underline dark:text-[#a8c0e0]"
                                >
                                  {hrefSite}
                                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                                </a>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                            <Link
                              href={`/audit-visuel/${r.id}`}
                              className={`${primaryButtonClass} inline-flex items-center gap-2 py-2.5 text-sm`}
                            >
                              Ouvrir
                              <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                            <button
                              type="button"
                              onClick={() => deleteOne(r.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-white/[0.1] dark:text-rose-400 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {showNew && (
        <div className={overlayBackdropClass} onClick={() => setShowNew(false)} role="presentation">
          <div
            className={overlayPanelNarrowClass}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-audit-title"
          >
            <div className={overlayHeaderClass}>
              <h2 id="new-audit-title" className={overlayTitleClass}>
                Nouvel audit visuel
              </h2>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className={overlayCloseButtonClass}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Liez l&apos;audit à un <strong className="font-semibold text-zinc-800 dark:text-zinc-200">prospect</strong>{" "}
                pour retrouver la même fiche depuis Prospection, ou laissez vide pour un audit libre.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={formLabelClass} htmlFor="new-audit-prospect">
                    Prospect (optionnel)
                  </label>
                  <select
                    id="new-audit-prospect"
                    value={newProspectId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewProspectId(v);
                      if (v) {
                        const p = prospects.find((x) => x.id === v);
                        if (p) {
                          setNewTitre(p.entreprise);
                          setNewSite(p.siteWeb ?? "");
                        }
                      }
                    }}
                    className={inputFieldClass}
                  >
                    <option value="">— Aucun (audit autonome) —</option>
                    {prospectsSorted.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.entreprise}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={formLabelClass} htmlFor="new-audit-titre">
                    Titre de l&apos;audit
                  </label>
                  <input
                    id="new-audit-titre"
                    type="text"
                    value={newTitre}
                    onChange={(e) => setNewTitre(e.target.value)}
                    placeholder="Sera prérempli si vous choisissez un prospect"
                    className={inputFieldClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass} htmlFor="new-audit-site">
                    Site web (optionnel)
                  </label>
                  <input
                    id="new-audit-site"
                    type="text"
                    inputMode="url"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                    placeholder="exemple.fr"
                    className={inputFieldClass}
                  />
                </div>
              </div>
            </div>
            <div className={overlayFooterClass}>
              <button type="button" onClick={() => setShowNew(false)} className={secondaryButtonClass}>
                Annuler
              </button>
              <button type="button" onClick={createAudit} className={primaryButtonClass}>
                Créer et ouvrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
