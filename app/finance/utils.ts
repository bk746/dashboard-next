import type { Depense, Facture } from "@/app/types";

/** Parse JJ/MM/AAAA */
export function parseDateFr(dateStr: string): Date | null {
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

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isInCurrentMonth(dateStr: string): boolean {
  const d = parseDateFr(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/** Date (facture / activité) dans le mois calendaire `month` (0–11) et `year`. */
export function isDateInMonth(dateStr: string, year: number, month: number): boolean {
  const d = parseDateFr(dateStr);
  if (!d) return false;
  return d.getFullYear() === year && d.getMonth() === month;
}

/** Date dans l’année civile `year`. */
export function isDateInCalendarYear(dateStr: string, year: number): boolean {
  const d = parseDateFr(dateStr);
  if (!d) return false;
  return d.getFullYear() === year;
}

/** Acompte pris en compte (plafonné au montant de la facture, ignoré si facture payée). */
export function getMontantAcompteFacture(f: Facture): number {
  if (f.statut === "Payé") return 0;
  const raw = f.montantAcompte ?? 0;
  return Math.max(0, Math.min(f.prix, Math.round(raw)));
}

/** Montant encore dû sur une facture non payée (0 si payée). */
export function getResteAPayerFacture(f: Facture): number {
  if (f.statut === "Payé") return 0;
  return Math.max(0, f.prix - getMontantAcompteFacture(f));
}

/** Encaissement réel : total si facture payée, sinon uniquement l’acompte (0 si aucun). */
export function getMontantEncaisseFacture(f: Facture): number {
  if (f.statut === "Payé") return f.prix;
  return getMontantAcompteFacture(f);
}

/** Facture impayée dont la date est strictement avant aujourd'hui (échéance = date de facture). */
export function isFactureEnRetard(f: Facture): boolean {
  if (f.statut !== "Non payé") return false;
  const d = parseDateFr(f.date);
  if (!d) return false;
  const today = startOfDay(new Date());
  return startOfDay(d).getTime() < today.getTime();
}

export function filterFacturesByPeriod(factures: Facture[], scope: "month" | "all"): Facture[] {
  if (scope === "all") return factures;
  return factures.filter((f) => isInCurrentMonth(f.date));
}

export function filterDevisByPeriod<T extends { date: string }>(items: T[], scope: "month" | "all"): T[] {
  if (scope === "all") return items;
  return items.filter((d) => isInCurrentMonth(d.date));
}

/** Lignes affichées dans le tableau dépenses (récurrentes toujours ; occasionnelles filtrées par mois si besoin). */
export function filterDepensesForDisplay(depenses: Depense[], scope: "month" | "all"): Depense[] {
  if (scope === "all") return depenses;
  return depenses.filter((d) => {
    if (d.type === "Récurrent") return true;
    return !!(d.date && isInCurrentMonth(d.date));
  });
}

export function computeDepenseTotals(depenses: Depense[], scope: "month" | "all"): {
  total: number;
  totalRecurrent: number;
  totalOccasionnel: number;
} {
  const recurrent = depenses.filter((d) => d.type === "Récurrent");
  const totalRecurrent = recurrent.reduce((s, d) => s + d.montant, 0);

  if (scope === "all") {
    const occasionnel = depenses.filter((d) => d.type === "Occasionnel");
    const totalOccasionnel = occasionnel.reduce((s, d) => s + d.montant, 0);
    return { total: totalRecurrent + totalOccasionnel, totalRecurrent, totalOccasionnel };
  }

  const occasionnelInMonth = depenses.filter(
    (d) => d.type === "Occasionnel" && d.date && isInCurrentMonth(d.date)
  );
  const totalOccasionnel = occasionnelInMonth.reduce((s, d) => s + d.montant, 0);
  return { total: totalRecurrent + totalOccasionnel, totalRecurrent, totalOccasionnel };
}
