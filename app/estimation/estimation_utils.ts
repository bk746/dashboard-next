import {
  estimationCategories,
  maintenancePlans,
  defaultRangeValue,
  type EstimationCategory,
  type EstimationItem,
} from "@/app/config/estimationTarifs";
import type { EstimationSaved, EstimationTarifOverride, PrestationDevis } from "@/app/types";
import { writeBucket } from "@/lib/syncBridge";

export const ESTIMATIONS_STORAGE_KEY = "estimations";

/** Préfixe des lignes de devis détaillant ce qui est inclus dans un forfait (montant 0 €). */
export const DEVIS_INCLUS_PREFIX = "Inclus — ";

export function mergeItem(base: EstimationItem, allOverrides: Record<string, EstimationTarifOverride>): EstimationItem {
  const o = allOverrides[base.id];
  if (!o) return base;
  return {
    ...base,
    ...(o.price !== undefined ? { price: o.price } : {}),
    ...(o.pricePerUnit !== undefined ? { pricePerUnit: o.pricePerUnit } : {}),
    ...(o.priceMin !== undefined ? { priceMin: o.priceMin } : {}),
    ...(o.priceMax !== undefined ? { priceMax: o.priceMax } : {}),
  };
}

export function withMergedCategories(
  overrides: Record<string, EstimationTarifOverride>
): EstimationCategory[] {
  return estimationCategories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => mergeItem(item, overrides)),
  }));
}

export function formatHint(
  item: EstimationItem,
  opts?: { vitrineForfaitSelected?: boolean }
): string {
  if (opts?.vitrineForfaitSelected && item.includedWithVitrineForfait) {
    return "inclus";
  }
  if (item.inclusAuDevis && item.kind === "fixed" && (item.price ?? 0) === 0) {
    return "inclus";
  }
  switch (item.kind) {
    case "fixed":
      return item.price != null ? `${item.price} €` : "";
    case "perUnit":
      return item.pricePerUnit != null && item.unitLabel
        ? `+${item.pricePerUnit} € / ${item.unitLabel}`
        : "";
    case "range":
      return item.priceMin != null && item.priceMax != null
        ? `${item.priceMin} – ${item.priceMax} €`
        : "";
    case "included":
      return item.note ?? "inclus";
    default:
      return "";
  }
}

export function lineAmount(
  item: EstimationItem,
  selected: boolean,
  qty: number,
  rangeVal: number,
  vitrineForfaitSelected?: boolean
): number {
  if (!selected || item.kind === "included") return 0;
  if (item.includedWithVitrineForfait && vitrineForfaitSelected) return 0;
  if (item.kind === "fixed") return item.price ?? 0;
  if (item.kind === "perUnit") return (item.pricePerUnit ?? 0) * qty;
  if (item.kind === "range") return rangeVal;
  return 0;
}

export function parseNum(s: string | undefined): number | undefined {
  if (s === undefined || s.trim() === "") return undefined;
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : undefined;
}

export function computeTotalsForEstimation(est: EstimationSaved): {
  totalOneShot: number;
  maintenanceMonthly: number;
} {
  const categoriesMerged = withMergedCategories(est.overrides);
  const maintenancePlansMerged = maintenancePlans.map((p) => ({
    ...p,
    priceMonthly: est.maintOverrides[p.id] ?? p.priceMonthly,
  }));

  let total = 0;
  for (const cat of categoriesMerged) {
    for (const item of cat.items) {
      if (item.kind === "included") continue;
      if (!est.selected[item.id]) continue;
      const q = est.qty[item.id] ?? 0;
      const r =
        item.kind === "range"
          ? (est.ranges[item.id] ?? defaultRangeValue(item))
          : 0;
      total += lineAmount(item, true, q, r, !!est.selected["vitrine-1-5"]);
    }
  }

  const maint = maintenancePlansMerged.find((p) => p.id === est.maintenanceId);
  const maintenanceMonthly = maint?.priceMonthly ?? 0;

  return { totalOneShot: total, maintenanceMonthly };
}

export function loadEstimationsFromStorage(): EstimationSaved[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ESTIMATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as EstimationSaved[];
  } catch {
    return [];
  }
}

export async function saveEstimationsToStorage(list: EstimationSaved[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await writeBucket(ESTIMATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function upsertEstimation(list: EstimationSaved[], updated: EstimationSaved): EstimationSaved[] {
  const i = list.findIndex((e) => e.id === updated.id);
  if (i === -1) return [...list, updated];
  const copy = [...list];
  copy[i] = updated;
  return copy;
}

/** Dernière estimation enregistrée pour ce client (la plus récemment modifiée). */
export function getLatestEstimationForClient(clientId: string): EstimationSaved | null {
  const list = loadEstimationsFromStorage().filter((e) => e.clientId === clientId);
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

/**
 * Transforme une estimation en lignes de devis (montant projet uniquement pour les options cochées).
 * La maintenance éventuelle est ajoutée en ligne à 0 € avec mention du montant mensuel.
 */
export function buildPrestationsFromEstimation(est: EstimationSaved): PrestationDevis[] {
  const lines: PrestationDevis[] = [];
  const categoriesMerged = withMergedCategories(est.overrides);

  for (const cat of categoriesMerged) {
    for (const item of cat.items) {
      if (item.kind === "included") continue;
      if (!est.selected[item.id]) continue;
      const q = est.qty[item.id] ?? 0;
      const r =
        item.kind === "range"
          ? (est.ranges[item.id] ?? defaultRangeValue(item))
          : 0;
      const amount = lineAmount(item, true, q, r, !!est.selected["vitrine-1-5"]);

      if (
        item.inclusAuDevis &&
        item.kind === "fixed" &&
        (item.price ?? 0) === 0
      ) {
        lines.push({
          designation: item.label,
          prix: 0,
          inclusForfait: true,
        });
        continue;
      }

      if (amount <= 0) continue;

      let designation = item.label;
      if (item.kind === "perUnit" && q > 0) {
        designation = `${item.label} × ${q} ${item.unitLabel ?? ""}`.trim();
      }

      lines.push({ designation, prix: Math.round(amount) });

      if (item.devisInclusions?.length) {
        for (const inc of item.devisInclusions) {
          lines.push({ designation: inc, prix: 0, inclusForfait: true });
        }
      }
    }
  }

  const maint = maintenancePlans
    .map((p) => ({
      ...p,
      priceMonthly: est.maintOverrides[p.id] ?? p.priceMonthly,
    }))
    .find((p) => p.id === est.maintenanceId);

  if (maint && maint.priceMonthly > 0) {
    lines.push({
      designation: `Maintenance mensuelle (${maint.label}) — ${maint.priceMonthly} €/mois HT (récurrent, en sus du montant projet)`,
      prix: 0,
    });
  }

  return lines;
}

export function emptyEstimationPayload(
  id: string,
  clientId: string,
  libelle: string | undefined
): EstimationSaved {
  const now = new Date().toISOString();
  return {
    id,
    clientId,
    libelle: libelle?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    selected: {},
    qty: {},
    ranges: {},
    maintenanceId: null,
    overrides: {},
    maintOverrides: {},
  };
}
