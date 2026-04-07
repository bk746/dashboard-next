"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  estimationCategories,
  maintenancePlans,
  defaultRangeValue,
  type EstimationItem,
} from "@/app/config/estimationTarifs";
import type { Client, EstimationTarifOverride } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  formatHint,
  lineAmount,
  loadEstimationsFromStorage,
  mergeItem,
  parseNum,
  saveEstimationsToStorage,
  upsertEstimation,
  withMergedCategories,
} from "@/app/estimation/estimation_utils";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  panelSurfaceClass,
  secondaryButtonClass,
  primaryButtonClass,
  inputFieldClass,
  overlayBackdropClass,
  overlayPanelWideClass,
  overlayPanelNarrowClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
  formLabelClass,
} from "@/app/components/appCardStyles";
import { ArrowLeft, Check, Pencil, RotateCcw, Save, X } from "lucide-react";

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

type ModalState =
  | { type: "category"; catId: string }
  | { type: "maintenance" }
  | null;

type DraftRow = {
  price?: string;
  pricePerUnit?: string;
  priceMin?: string;
  priceMax?: string;
};

export default function EstimationEditor({ estimationId }: { estimationId: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [clients] = useJsonBucket<Client[]>("clients", []);
  const [meta, setMeta] = useState<{
    clientId: string;
    libelle: string;
    createdAt: string;
  } | null>(null);

  const [overrides, setOverrides] = useState<Record<string, EstimationTarifOverride>>({});
  const [maintOverrides, setMaintOverrides] = useState<Record<string, number>>({});

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [ranges, setRanges] = useState<Record<string, number>>({});
  const [maintenanceId, setMaintenanceId] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<Record<string, DraftRow>>({});
  const [maintDraft, setMaintDraft] = useState<Record<string, string>>({});

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const list = loadEstimationsFromStorage();
    const est = list.find((e) => e.id === estimationId);
    if (!est) {
      router.replace("/estimation");
      return;
    }
    setMeta({
      clientId: est.clientId,
      libelle: est.libelle ?? "",
      createdAt: est.createdAt,
    });
    setSelected(est.selected ?? {});
    setQty(est.qty ?? {});
    setRanges(est.ranges ?? {});
    setMaintenanceId(est.maintenanceId ?? null);
    setOverrides(est.overrides ?? {});
    setMaintOverrides(est.maintOverrides ?? {});
    setReady(true);
  }, [estimationId, router]);

  useEffect(() => {
    if (!ready || !meta) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const list = loadEstimationsFromStorage();
      const updated = {
        id: estimationId,
        clientId: meta.clientId,
        libelle: meta.libelle.trim() || undefined,
        createdAt: meta.createdAt,
        updatedAt: new Date().toISOString(),
        selected,
        qty,
        ranges,
        maintenanceId,
        overrides,
        maintOverrides,
      };
      void saveEstimationsToStorage(upsertEstimation(list, updated)).catch(() => {});
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    ready,
    meta,
    estimationId,
    selected,
    qty,
    ranges,
    maintenanceId,
    overrides,
    maintOverrides,
  ]);

  const saveEstimationNow = useCallback(() => {
    if (!ready || !meta) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const list = loadEstimationsFromStorage();
    const updated = {
      id: estimationId,
      clientId: meta.clientId,
      libelle: meta.libelle.trim() || undefined,
      createdAt: meta.createdAt,
      updatedAt: new Date().toISOString(),
      selected,
      qty,
      ranges,
      maintenanceId,
      overrides,
      maintOverrides,
    };
    void saveEstimationsToStorage(upsertEstimation(list, updated)).catch(() => {});
    setJustSaved(true);
  }, [
    ready,
    meta,
    estimationId,
    selected,
    qty,
    ranges,
    maintenanceId,
    overrides,
    maintOverrides,
  ]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(t);
  }, [justSaved]);

  const categoriesMerged = useMemo(() => withMergedCategories(overrides), [overrides]);

  const maintenancePlansMerged = useMemo(
    () =>
      maintenancePlans.map((p) => ({
        ...p,
        priceMonthly: maintOverrides[p.id] ?? p.priceMonthly,
      })),
    [maintOverrides]
  );

  useEffect(() => {
    setRanges((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const cat of categoriesMerged) {
        for (const item of cat.items) {
          if (item.kind !== "range" || item.priceMin == null || item.priceMax == null) continue;
          const min = item.priceMin;
          const max = item.priceMax;
          const v = next[item.id];
          if (v !== undefined && (v < min || v > max)) {
            next[item.id] = Math.min(max, Math.max(min, v));
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [categoriesMerged]);

  const toggleItem = useCallback((item: EstimationItem) => {
    setSelected((prev) => {
      const on = !prev[item.id];
      if (on && item.kind === "perUnit") {
        setQty((q) => ({ ...q, [item.id]: q[item.id] ?? 1 }));
      }
      if (on && item.kind === "range") {
        setRanges((r) => ({
          ...r,
          [item.id]: r[item.id] ?? defaultRangeValue(item),
        }));
      }
      return { ...prev, [item.id]: on };
    });
  }, []);

  const { lines, totalOneShot, maintenanceMonthly } = useMemo(() => {
    const lines: { id: string; label: string; amount: number; inclusRecap?: boolean }[] = [];
    let total = 0;

    for (const cat of categoriesMerged) {
      for (const item of cat.items) {
        if (item.kind === "included") continue;
        if (!selected[item.id]) continue;
        const q = qty[item.id] ?? 0;
        const r =
          item.kind === "range"
            ? (ranges[item.id] ?? defaultRangeValue(item))
            : 0;
        const amount = lineAmount(item, true, q, r, !!selected["vitrine-1-5"]);

        if (item.inclusAuDevis && item.kind === "fixed" && (item.price ?? 0) === 0) {
          lines.push({ id: item.id, label: item.label, amount: 0, inclusRecap: true });
          continue;
        }

        if (amount > 0) {
          lines.push({ id: item.id, label: item.label, amount });
          total += amount;
          if (item.devisInclusions?.length) {
            item.devisInclusions.forEach((inc, i) => {
              lines.push({
                id: `${item.id}-inc-${i}`,
                label: inc,
                amount: 0,
                inclusRecap: true,
              });
            });
          }
        }
      }
    }

    const maint = maintenancePlansMerged.find((p) => p.id === maintenanceId);
    const maintenanceMonthly = maint?.priceMonthly ?? 0;

    return { lines, totalOneShot: total, maintenanceMonthly };
  }, [categoriesMerged, selected, qty, ranges, maintenanceId, maintenancePlansMerged]);

  const openCategoryModal = useCallback(
    (catId: string) => {
      const cat = estimationCategories.find((c) => c.id === catId);
      if (!cat) return;
      const d: Record<string, DraftRow> = {};
      for (const item of cat.items) {
        const m = mergeItem(item, overrides);
        if (item.kind === "included") continue;
        if (item.kind === "fixed") {
          d[item.id] = { price: m.price != null ? String(m.price) : "" };
        } else if (item.kind === "perUnit") {
          d[item.id] = { pricePerUnit: m.pricePerUnit != null ? String(m.pricePerUnit) : "" };
        } else if (item.kind === "range") {
          d[item.id] = {
            priceMin: m.priceMin != null ? String(m.priceMin) : "",
            priceMax: m.priceMax != null ? String(m.priceMax) : "",
          };
        }
      }
      setDraft(d);
      setModal({ type: "category", catId });
    },
    [overrides]
  );

  const saveCategoryModal = useCallback(() => {
    if (modal?.type !== "category") return;
    const cat = estimationCategories.find((c) => c.id === modal.catId);
    if (!cat) return;

    setOverrides((prev) => {
      const next = { ...prev };
      for (const item of cat.items) {
        if (item.kind === "included") continue;
        const row = draft[item.id];
        const cur: EstimationTarifOverride = { ...(next[item.id] ?? {}) };

        if (item.kind === "fixed") {
          const v = parseNum(row?.price);
          if (v === undefined) delete cur.price;
          else cur.price = v;
        } else if (item.kind === "perUnit") {
          const v = parseNum(row?.pricePerUnit);
          if (v === undefined) delete cur.pricePerUnit;
          else cur.pricePerUnit = v;
        } else if (item.kind === "range") {
          let vmin = parseNum(row?.priceMin);
          let vmax = parseNum(row?.priceMax);
          if (vmin !== undefined && vmax !== undefined && vmin > vmax) {
            const t = vmin;
            vmin = vmax;
            vmax = t;
          }
          if (vmin === undefined) delete cur.priceMin;
          else cur.priceMin = vmin;
          if (vmax === undefined) delete cur.priceMax;
          else cur.priceMax = vmax;
        }

        if (Object.keys(cur).length === 0) delete next[item.id];
        else next[item.id] = cur;
      }
      return next;
    });
    setModal(null);
  }, [modal, draft]);

  const resetCategoryOverrides = useCallback(() => {
    if (modal?.type !== "category") return;
    const cat = estimationCategories.find((c) => c.id === modal.catId);
    if (!cat) return;
    setOverrides((prev) => {
      const next = { ...prev };
      for (const item of cat.items) {
        delete next[item.id];
      }
      return next;
    });
    setModal(null);
  }, [modal]);

  const openMaintenanceModal = useCallback(() => {
    const d: Record<string, string> = {};
    for (const p of maintenancePlans) {
      const m = maintOverrides[p.id] ?? p.priceMonthly;
      d[p.id] = String(m);
    }
    setMaintDraft(d);
    setModal({ type: "maintenance" });
  }, [maintOverrides]);

  const saveMaintenanceModal = useCallback(() => {
    setMaintOverrides((prev) => {
      const next = { ...prev };
      for (const p of maintenancePlans) {
        const v = parseNum(maintDraft[p.id]);
        if (v === undefined) delete next[p.id];
        else next[p.id] = v;
      }
      return next;
    });
    setModal(null);
  }, [maintDraft]);

  const resetMaintenanceOverrides = useCallback(() => {
    setMaintOverrides({});
    setModal(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelected({});
    setQty({});
    setRanges({});
    setMaintenanceId(null);
    setOverrides({});
    setMaintOverrides({});
  }, []);

  const entrepriseLabel = useMemo(() => {
    if (!meta) return "";
    const c = clients.find((x) => x.id === meta.clientId);
    return c?.entreprise ?? "Client inconnu ou supprimé";
  }, [clients, meta]);

  const editingCategory =
    modal?.type === "category"
      ? estimationCategories.find((c) => c.id === modal.catId)
      : null;

  if (!ready || !meta) {
    return (
      <div className={pageShellClass}>
        <div className="max-w-6xl mx-auto py-16 text-center text-zinc-500 dark:text-zinc-400">
          Chargement de l&apos;estimation…
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Link
            href="/estimation"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#ED8600] dark:hover:text-[#8fa9c9] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Mes estimations
          </Link>
        </div>
        <p className={pageEyebrowClass}>Finance</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={pageTitleClass}>Estimation de prestation</h1>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">{entrepriseLabel}</span>
              <span className="text-zinc-400 dark:text-zinc-500"> · </span>
              <Link
                href="/clients"
                className="text-[#ED8600] dark:text-[#8fa9c9] hover:underline underline-offset-2"
              >
                Fiche clients
              </Link>
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className={formLabelClass} htmlFor="estimation-libelle">
              Libellé (optionnel)
            </label>
            <input
              id="estimation-libelle"
              type="text"
              className={inputFieldClass}
              placeholder="Ex. Site vitrine Q1"
              value={meta.libelle}
              onChange={(e) => setMeta((m) => (m ? { ...m, libelle: e.target.value } : m))}
            />
          </div>
        </div>
        <p className={`${pageSubtitleClass} mt-3`}>
          Cochez les options correspondant au projet. Les tarifs par défaut viennent de{" "}
          <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            app/config/estimationTarifs.ts
          </code>{" "}
          ; vous pouvez les ajuster par section via « Tarifs » (enregistré automatiquement pour cette estimation).
        </p>

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_min(100%,340px)] lg:gap-8 lg:items-start">
          <div className="space-y-6 order-2 lg:order-1">
            {categoriesMerged.map((cat) => (
              <section
                key={cat.id}
                className={`${panelSurfaceClass} p-4 sm:p-5 md:p-6`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 min-w-0">
                    <span aria-hidden>{cat.emoji}</span>
                    <span>{cat.title}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => openCategoryModal(cat.id)}
                    className={`${secondaryButtonClass} shrink-0 inline-flex items-center gap-1.5 py-2 px-3 text-sm`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Tarifs
                  </button>
                </div>
                {cat.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 max-w-3xl">
                    {cat.description}
                  </p>
                )}
                <ul className="space-y-3">
                  {cat.items.map((item) => {
                    const hintOpts = { vitrineForfaitSelected: !!selected["vitrine-1-5"] };
                    const priceHint = formatHint(item, hintOpts);
                    return (
                    <li key={item.id}>
                      {item.kind === "included" ? (
                        <div className="rounded-lg border border-dashed border-zinc-200/90 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-white/[0.03] px-3 py-2.5 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-zinc-800 dark:text-zinc-100">{item.label}</span>
                              {item.description && (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                              {item.note ?? "Inclus"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-zinc-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0d0e14] px-3 py-2.5">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#ED8600] focus:ring-[#ED8600]/30 dark:border-white/[0.12] dark:bg-[#0a0a0c] dark:text-[#8fa9c9] dark:focus:ring-[#8fa9c9]/30"
                              checked={!!selected[item.id]}
                              onChange={() => toggleItem(item)}
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                                {item.label}
                              </span>
                              {item.description && (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                              <span
                                className={`mt-1 block text-xs font-medium tabular-nums ${
                                  priceHint === "inclus"
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-zinc-600 dark:text-zinc-500"
                                }`}
                              >
                                {priceHint}
                              </span>
                            </span>
                          </label>

                          {selected[item.id] && item.kind === "perUnit" && (
                            <div className="mt-3 pl-7 flex flex-wrap items-center gap-2">
                              <label
                                className="text-xs text-zinc-500 dark:text-zinc-400"
                                htmlFor={`qty-${item.id}`}
                              >
                                Quantité ({item.unitLabel ?? "unité"})
                              </label>
                              <input
                                id={`qty-${item.id}`}
                                type="number"
                                min={item.minQty ?? 0}
                                max={item.maxQty ?? 9999}
                                className={`${inputFieldClass} w-24 py-1.5 text-sm tabular-nums`}
                                value={qty[item.id] ?? 0}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10);
                                  setQty((q) => ({
                                    ...q,
                                    [item.id]: Number.isFinite(v) ? v : 0,
                                  }));
                                }}
                              />
                            </div>
                          )}

                          {selected[item.id] &&
                            item.kind === "range" &&
                            item.priceMin != null &&
                            item.priceMax != null && (
                              <div className="mt-3 pl-7 space-y-2">
                                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                  <span>{eur.format(item.priceMin)}</span>
                                  <span className="font-medium text-zinc-700 dark:text-zinc-200 tabular-nums">
                                    {eur.format(ranges[item.id] ?? defaultRangeValue(item))}
                                  </span>
                                  <span>{eur.format(item.priceMax)}</span>
                                </div>
                                <input
                                  type="range"
                                  min={item.priceMin}
                                  max={item.priceMax}
                                  step={Math.max(
                                    50,
                                    Math.round((item.priceMax - item.priceMin) / 40)
                                  )}
                                  className="w-full accent-[#ED8600] dark:accent-[#8fa9c9]"
                                  value={ranges[item.id] ?? defaultRangeValue(item)}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setRanges((r) => ({ ...r, [item.id]: v }));
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <section className={`${panelSurfaceClass} p-4 sm:p-5 md:p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <span aria-hidden>🔄</span>
                  <span>Maintenance (mensuelle)</span>
                </h2>
                <button
                  type="button"
                  onClick={openMaintenanceModal}
                  className={`${secondaryButtonClass} shrink-0 inline-flex items-center gap-1.5 py-2 px-3 text-sm`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Tarifs
                </button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 max-w-3xl">
                Abonnement pour corrections, mises à jour et disponibilité après la livraison. Un seul forfait au choix
                (optionnel).
              </p>
              <div className="space-y-2">
                {maintenancePlansMerged.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex cursor-pointer flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-sm transition-colors sm:flex-row sm:items-start sm:justify-between ${
                      maintenanceId === plan.id
                        ? "border-[#ED8600]/50 bg-[#ED8600]/5 dark:border-[#8fa9c9]/40 dark:bg-[#8fa9c9]/10"
                        : "border-zinc-200/80 dark:border-white/[0.06] hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-start gap-2">
                      <input
                        type="radio"
                        name="maintenance"
                        className="mt-0.5 h-4 w-4 shrink-0 border-zinc-300 text-[#ED8600] focus:ring-[#ED8600]/30 dark:border-white/[0.12] dark:text-[#8fa9c9]"
                        checked={maintenanceId === plan.id}
                        onChange={() => setMaintenanceId(plan.id)}
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">{plan.label}</span>
                        {plan.description && (
                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {plan.description}
                          </p>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums font-medium text-zinc-700 dark:text-zinc-300 sm:pt-0.5">
                      {eur.format(plan.priceMonthly)}/mois
                    </span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setMaintenanceId(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
                >
                  Aucune maintenance
                </button>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2 pb-8 lg:pb-0">
              <button
                type="button"
                onClick={saveEstimationNow}
                className={primaryButtonClass + " inline-flex items-center justify-center gap-2"}
              >
                {justSaved ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                    Enregistré
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 shrink-0" aria-hidden />
                    Sauvegarder cette estimation
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className={secondaryButtonClass + " inline-flex items-center gap-2"}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Réinitialiser
              </button>
            </div>
          </div>

          <aside className="order-1 lg:order-2 mb-6 lg:mb-0 lg:sticky lg:top-6">
            <div className={`${panelSurfaceClass} p-4 sm:p-5`}>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
                Récapitulatif
              </h3>
              {lines.length === 0 && !maintenanceId ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Sélectionnez des options pour voir le total.
                </p>
              ) : (
                <ul className="max-h-[min(50vh,420px)] overflow-y-auto space-y-2 text-sm border-b border-zinc-100 dark:border-white/[0.06] pb-3 mb-3">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3 text-zinc-600 dark:text-zinc-400">
                      <span
                        className={`min-w-0 flex-1 ${l.inclusRecap ? "pl-2 border-l border-zinc-200 dark:border-white/[0.08] text-zinc-500" : ""}`}
                      >
                        {l.label}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-800 dark:text-zinc-200">
                        {l.inclusRecap ? "Inclus" : eur.format(l.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total projet</span>
                  <span className="text-xl font-semibold tabular-nums text-[#ED8600] dark:text-[#8fa9c9]">
                    {eur.format(totalOneShot)}
                  </span>
                </div>
                {maintenanceMonthly > 0 && (
                  <div className="flex justify-between items-baseline gap-3 pt-2 border-t border-dashed border-zinc-200 dark:border-white/[0.08]">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Maintenance / mois</span>
                    <span className="text-lg font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                      {eur.format(maintenanceMonthly)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug">
                Utilisez « Sauvegarder cette estimation » en bas de page pour enregistrer tout de suite. Une sauvegarde
                automatique a aussi lieu après chaque modification.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {modal?.type === "category" && editingCategory && (
        <div
          className={overlayBackdropClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="estimation-modal-title"
        >
          <div className={overlayPanelWideClass}>
            <div className={overlayHeaderClass}>
              <h2 id="estimation-modal-title" className={overlayTitleClass}>
                Tarifs — {editingCategory.emoji} {editingCategory.title}
              </h2>
              <button
                type="button"
                className={overlayCloseButtonClass}
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Montants en euros (€). Laissez un champ vide pour revenir au défaut du fichier de config.
              </p>
              <div className="space-y-5">
                {editingCategory.items.map((item) => {
                  if (item.kind === "included") return null;
                  const row = draft[item.id] ?? {};
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-zinc-200/80 dark:border-white/[0.08] p-4 space-y-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.label}</p>
                        {item.description && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.kind === "fixed" && (
                        <div>
                          <label className={formLabelClass} htmlFor={`draft-${item.id}-price`}>
                            Prix (€)
                          </label>
                          <input
                            id={`draft-${item.id}-price`}
                            type="text"
                            inputMode="decimal"
                            className={inputFieldClass}
                            value={row.price ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [item.id]: { ...d[item.id], price: e.target.value },
                              }))
                            }
                          />
                        </div>
                      )}
                      {item.kind === "perUnit" && (
                        <div>
                          <label className={formLabelClass} htmlFor={`draft-${item.id}-pu`}>
                            Prix par {item.unitLabel ?? "unité"} (€)
                          </label>
                          <input
                            id={`draft-${item.id}-pu`}
                            type="text"
                            inputMode="decimal"
                            className={inputFieldClass}
                            value={row.pricePerUnit ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [item.id]: { ...d[item.id], pricePerUnit: e.target.value },
                              }))
                            }
                          />
                        </div>
                      )}
                      {item.kind === "range" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={formLabelClass} htmlFor={`draft-${item.id}-min`}>
                              Minimum (€)
                            </label>
                            <input
                              id={`draft-${item.id}-min`}
                              type="text"
                              inputMode="decimal"
                              className={inputFieldClass}
                              value={row.priceMin ?? ""}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  [item.id]: {
                                    ...d[item.id],
                                    priceMin: e.target.value,
                                    priceMax: d[item.id]?.priceMax,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className={formLabelClass} htmlFor={`draft-${item.id}-max`}>
                              Maximum (€)
                            </label>
                            <input
                              id={`draft-${item.id}-max`}
                              type="text"
                              inputMode="decimal"
                              className={inputFieldClass}
                              value={row.priceMax ?? ""}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  [item.id]: {
                                    ...d[item.id],
                                    priceMin: d[item.id]?.priceMin,
                                    priceMax: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={overlayFooterClass}>
              <button type="button" className={secondaryButtonClass} onClick={resetCategoryOverrides}>
                Réinitialiser la section
              </button>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end w-full sm:w-auto">
                <button type="button" className={secondaryButtonClass} onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="button" className={primaryButtonClass} onClick={saveCategoryModal}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "maintenance" && (
        <div
          className={overlayBackdropClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="estimation-maint-modal-title"
        >
          <div className={overlayPanelNarrowClass}>
            <div className={overlayHeaderClass}>
              <h2 id="estimation-maint-modal-title" className={overlayTitleClass}>
                Tarifs — Maintenance
              </h2>
              <button
                type="button"
                className={overlayCloseButtonClass}
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Prix mensuel en €. Champ vide = défaut du fichier de config.
              </p>
              <div className="space-y-4">
                {maintenancePlans.map((p) => (
                  <div key={p.id}>
                    <label className={formLabelClass} htmlFor={`maint-${p.id}`}>
                      {p.label} (€/mois)
                    </label>
                    <input
                      id={`maint-${p.id}`}
                      type="text"
                      inputMode="decimal"
                      className={inputFieldClass}
                      value={maintDraft[p.id] ?? ""}
                      onChange={(e) =>
                        setMaintDraft((d) => ({ ...d, [p.id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={overlayFooterClass}>
              <button type="button" className={secondaryButtonClass} onClick={resetMaintenanceOverrides}>
                Réinitialiser
              </button>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end w-full sm:w-auto">
                <button type="button" className={secondaryButtonClass} onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="button" className={primaryButtonClass} onClick={saveMaintenanceModal}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
