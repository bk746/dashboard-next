import type { Client, Facture, Objectif, ObjectifPeriode } from "@/app/types";
import {
  parseDateFr,
  isDateInMonth,
  isDateInCalendarYear,
  getMontantEncaisseFacture,
} from "@/app/finance/utils";

export function normalizeObjectifPeriode(p?: ObjectifPeriode): ObjectifPeriode {
  if (p === "mois" || p === "semaine") return p;
  return "annee";
}

/** Semaine calendaire locale : lundi 00:00 → dimanche 23:59:59. */
export function getWeekBounds(now = new Date()): { start: Date; end: Date } {
  const d = new Date(now);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function dateStrInRange(dateStr: string, start: Date, end: Date): boolean {
  const parsed = parseDateFr(dateStr);
  if (!parsed) return false;
  const t = parsed.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function getActuelPourObjectif(
  obj: Objectif,
  factures: Facture[],
  clients: Client[],
  now = new Date()
): number {
  const periode = normalizeObjectifPeriode(obj.periode);
  if (obj.type === "Financier") {
    if (periode === "annee") {
      const y = now.getFullYear();
      return factures
        .filter((f) => isDateInCalendarYear(f.date, y))
        .reduce((s, f) => s + getMontantEncaisseFacture(f), 0);
    }
    if (periode === "mois") {
      return factures
        .filter((f) => isDateInMonth(f.date, now.getFullYear(), now.getMonth()))
        .reduce((s, f) => s + getMontantEncaisseFacture(f), 0);
    }
    const { start, end } = getWeekBounds(now);
    return factures
      .filter((f) => dateStrInRange(f.date, start, end))
      .reduce((s, f) => s + getMontantEncaisseFacture(f), 0);
  }
  if (periode === "annee") {
    return clients.length;
  }
  if (periode === "mois") {
    return clients.filter((c) => isDateInMonth(c.derniereActivite, now.getFullYear(), now.getMonth())).length;
  }
  const { start, end } = getWeekBounds(now);
  return clients.filter((c) => dateStrInRange(c.derniereActivite, start, end)).length;
}

export function periodeLabelFr(periode: ObjectifPeriode): string {
  switch (periode) {
    case "semaine":
      return "Semaine";
    case "mois":
      return "Mois";
    default:
      return "Année";
  }
}

export function getFinancierEncaisseLabel(periode: ObjectifPeriode): string {
  switch (periode) {
    case "semaine":
      return "CA encaissé sur la semaine en cours (lun.–dim.)";
    case "mois":
      return "CA encaissé sur le mois en cours";
    default:
      return "CA encaissé sur l'année civile en cours";
  }
}
