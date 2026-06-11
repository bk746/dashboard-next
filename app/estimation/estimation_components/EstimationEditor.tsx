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
import { overlayBackdropClass, overlayScrollBodyClass } from "@/app/components/appCardStyles";
import {
  estimationShellClass,
  estimationFloatingCard,
  estimationPrimaryBtn,
  estimationSecondaryBtn,
  estimationLightInput,
  estimationLightLabel,
  estimationLightPanelWide,
  estimationLightPanel,
  estimationVioletPrimaryBtn,
  estimationOptionCardClass,
} from "@/app/estimation/estimationUi";
import { EstimationOptionCard, MaintenanceOptionCard } from "./EstimationOptionCard";
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
      <div className={estimationShellClass}>
        <div className="md:max-w-[1600px] md:mx-auto py-16 text-center text-zinc-500">
          Chargement de l&apos;estimation…
        </div>
      </div>
    );
  }

  return (
    <div className={estimationShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 space-y-4">
          <Link
            href="/estimation"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007AFF] hover:underline"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Retour aux estimations
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]">
                {entrepriseLabel}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                <Link href="/clients" className="font-medium text-[#007AFF] hover:underline">
                  Fiche client
                </Link>
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className={estimationLightLabel} htmlFor="estimation-libelle">
                Libellé (optionnel)
              </label>
              <input
                id="estimation-libelle"
                type="text"
                className={estimationLightInput}
                placeholder="Ex. Site vitrine Q1"
                value={meta.libelle}
                onChange={(e) => setMeta((m) => (m ? { ...m, libelle: e.target.value } : m))}
              />
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_min(100%,340px)] lg:gap-8 lg:items-start">
          <div className="space-y-6 order-2 lg:order-1">
            {categoriesMerged.map((cat) => (
              <section key={cat.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                  <h2 className="text-base font-semibold text-zinc-900">
                    <span className="mr-1.5" aria-hidden>
                      {cat.emoji}
                    </span>
                    {cat.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => openCategoryModal(cat.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#007AFF] hover:bg-[#007AFF]/10"
                  >
                    <Pencil className="h-3 w-3" aria-hidden />
                    Tarifs
                  </button>
                </div>
                {cat.description ? (
                  <p className="px-0.5 text-xs text-zinc-500 line-clamp-2">{cat.description}</p>
                ) : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {cat.items.map((item) => {
                    const hintOpts = { vitrineForfaitSelected: !!selected["vitrine-1-5"] };
                    const priceHint = formatHint(item, hintOpts);
                    const isSelected = !!selected[item.id];
                    return (
                      <EstimationOptionCard
                        key={item.id}
                        item={item}
                        selected={isSelected}
                        priceLabel={priceHint}
                        qty={qty[item.id] ?? 0}
                        rangeValue={ranges[item.id] ?? defaultRangeValue(item)}
                        onToggle={() => toggleItem(item)}
                        onQtyChange={(v) => setQty((q) => ({ ...q, [item.id]: v }))}
                        onRangeChange={(v) => setRanges((r) => ({ ...r, [item.id]: v }))}
                      />
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                <h2 className="text-base font-semibold text-zinc-900">
                  <span className="mr-1.5" aria-hidden>
                    🔄
                  </span>
                  Maintenance
                </h2>
                <button
                  type="button"
                  onClick={openMaintenanceModal}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#007AFF] hover:bg-[#007AFF]/10"
                >
                  <Pencil className="h-3 w-3" aria-hidden />
                  Tarifs
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {maintenancePlansMerged.map((plan) => (
                  <MaintenanceOptionCard
                    key={plan.id}
                    label={plan.label}
                    description={plan.description}
                    priceLabel={`${eur.format(plan.priceMonthly)}/mois`}
                    selected={maintenanceId === plan.id}
                    onSelect={() => setMaintenanceId(maintenanceId === plan.id ? null : plan.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setMaintenanceId(null)}
                  className={`${estimationOptionCardClass(maintenanceId === null)} text-sm text-zinc-600`}
                >
                  Aucune maintenance
                </button>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2 pb-8 lg:pb-0">
              <button
                type="button"
                onClick={saveEstimationNow}
                className={estimationPrimaryBtn + " inline-flex items-center justify-center gap-2"}
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
                className={estimationSecondaryBtn + " inline-flex items-center gap-2"}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Réinitialiser
              </button>
            </div>
          </div>

          <aside className="order-1 lg:order-2 mb-6 lg:mb-0 lg:sticky lg:top-6">
            <div className={`${estimationFloatingCard} p-4 sm:p-5`}>
              <h3 className="text-sm font-semibold text-zinc-900">Récapitulatif</h3>
              {lines.length === 0 && !maintenanceId ? (
                <p className="text-sm text-zinc-500">
                  Sélectionnez des options pour voir le total.
                </p>
              ) : (
                <ul className="max-h-[min(50vh,420px)] overflow-y-auto space-y-2 text-sm border-b border-zinc-100">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3 text-zinc-600">
                      <span
                        className={`min-w-0 flex-1 ${l.inclusRecap ? "pl-2 border-l border-zinc-200" : ""}`}
                      >
                        {l.label}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-800">
                        {l.inclusRecap ? "Inclus" : eur.format(l.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-sm font-medium text-zinc-700">Total projet</span>
                  <span className="text-xl font-semibold tabular-nums text-[#007AFF]">
                    {eur.format(totalOneShot)}
                  </span>
                </div>
                {maintenanceMonthly > 0 && (
                  <div className="flex justify-between items-baseline gap-3 pt-2 border-t border-dashed border-zinc-200">
                    <span className="text-sm text-zinc-600">Maintenance / mois</span>
                    <span className="text-lg font-semibold tabular-nums text-zinc-800">
                      {eur.format(maintenanceMonthly)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-[11px] text-zinc-400">
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
          <div
            className={estimationLightPanelWide}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
              <h2 id="estimation-modal-title" className="text-lg font-semibold tracking-tight text-zinc-900 pr-2">
                Tarifs — {editingCategory.emoji} {editingCategory.title}
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              <p className="text-sm text-zinc-500">
                Montants en euros (€). Laissez un champ vide pour revenir au défaut du fichier de config.
              </p>
              <div className="space-y-5">
                {editingCategory.items.map((item) => {
                  if (item.kind === "included") return null;
                  const row = draft[item.id] ?? {};
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-zinc-200/80"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{item.label}</p>
                        {item.description && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.kind === "fixed" && (
                        <div>
                          <label className={estimationLightLabel} htmlFor={`draft-${item.id}-price`}>
                            Prix (€)
                          </label>
                          <input
                            id={`draft-${item.id}-price`}
                            type="text"
                            inputMode="decimal"
                            className={estimationLightInput}
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
                          <label className={estimationLightLabel} htmlFor={`draft-${item.id}-pu`}>
                            Prix par {item.unitLabel ?? "unité"} (€)
                          </label>
                          <input
                            id={`draft-${item.id}-pu`}
                            type="text"
                            inputMode="decimal"
                            className={estimationLightInput}
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
                            <label className={estimationLightLabel} htmlFor={`draft-${item.id}-min`}>
                              Minimum (€)
                            </label>
                            <input
                              id={`draft-${item.id}-min`}
                              type="text"
                              inputMode="decimal"
                              className={estimationLightInput}
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
                            <label className={estimationLightLabel} htmlFor={`draft-${item.id}-max`}>
                              Maximum (€)
                            </label>
                            <input
                              id={`draft-${item.id}-max`}
                              type="text"
                              inputMode="decimal"
                              className={estimationLightInput}
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
            <div className="flex shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 sm:px-6">
              <button type="button" className={estimationSecondaryBtn} onClick={resetCategoryOverrides}>
                Réinitialiser la section
              </button>
              <button type="button" className={estimationSecondaryBtn} onClick={() => setModal(null)}>
                Annuler
              </button>
              <button type="button" className={estimationVioletPrimaryBtn} onClick={saveCategoryModal}>
                Enregistrer
              </button>
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
          <div className={estimationLightPanel} onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
              <h2 id="estimation-maint-modal-title" className="text-lg font-semibold tracking-tight text-zinc-900">
                Tarifs — Maintenance
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              <p className="text-sm text-zinc-500">
                Prix mensuel en €. Champ vide = défaut du fichier de config.
              </p>
              <div className="space-y-4">
                {maintenancePlans.map((p) => (
                  <div key={p.id}>
                    <label className={estimationLightLabel} htmlFor={`maint-${p.id}`}>
                      {p.label} (€/mois)
                    </label>
                    <input
                      id={`maint-${p.id}`}
                      type="text"
                      inputMode="decimal"
                      className={estimationLightInput}
                      value={maintDraft[p.id] ?? ""}
                      onChange={(e) =>
                        setMaintDraft((d) => ({ ...d, [p.id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
              <button type="button" className={estimationSecondaryBtn} onClick={resetMaintenanceOverrides}>
                Réinitialiser
              </button>
              <button type="button" className={estimationSecondaryBtn} onClick={() => setModal(null)}>
                Annuler
              </button>
              <button type="button" className={estimationVioletPrimaryBtn} onClick={saveMaintenanceModal}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
