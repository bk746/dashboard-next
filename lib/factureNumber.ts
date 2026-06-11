import type { Facture } from "@/app/types";

/**
 * Numérotation des factures — séquence continue par année : FAC-AAAA-NNNN.
 * Conformité fiscale : chaque numéro est unique, croissant, sans trou créé à l'émission
 * (on prend toujours max + 1, jamais le nombre de lignes — robuste aux suppressions).
 */

const PATTERN_ANNEE = /^FAC-(\d{4})-(\d+)$/;
const PATTERN_LEGACY = /^FAC-(\d+)$/;

/** Prochain numéro pour l'année en cours, basé sur le max existant. */
export function nextNumeroFacture(factures: Facture[], now: Date = new Date()): string {
  const year = now.getFullYear();
  let maxSeq = 0;

  for (const f of factures) {
    const num = f.numeroFacture?.trim() ?? "";
    const m = PATTERN_ANNEE.exec(num);
    if (m && Number(m[1]) === year) {
      maxSeq = Math.max(maxSeq, Number(m[2]));
      continue;
    }
    // Anciens numéros FAC-000123 : on les compte dans la séquence pour ne jamais redescendre.
    const legacy = PATTERN_LEGACY.exec(num);
    if (legacy) {
      maxSeq = Math.max(maxSeq, Number(legacy[1]));
    }
  }

  return `FAC-${year}-${String(maxSeq + 1).padStart(4, "0")}`;
}

/** Un autre document porte-t-il déjà ce numéro ? (excludeId = facture en cours d'édition) */
export function isNumeroFactureDuplique(
  factures: Facture[],
  numero: string,
  excludeId?: string
): boolean {
  const n = numero.trim().toLowerCase();
  return factures.some((f) => f.id !== excludeId && f.numeroFacture.trim().toLowerCase() === n);
}
