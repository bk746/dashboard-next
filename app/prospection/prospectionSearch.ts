import type { Prospect } from "@/app/types";
import { ETAPES_CONTACT } from "@/app/prospection/prospection_utils";

/** Normalise pour recherche insensible à la casse, aux accents et à la ponctuation. */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''`´]/g, "'")
    .replace(/[\u00a0\u2000-\u200b]+/g, " ");
}

/** Version compacte (sans espaces ni séparateurs) — « 3btp » trouve « 3 BTP ». */
export function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/[\s\-_./@#]+/g, "");
}

function etapeLabel(etape: string): string {
  return ETAPES_CONTACT.find((e) => e.value === etape)?.label ?? etape;
}

function reponseLabel(reponse: string): string {
  switch (reponse) {
    case "valide":
      return "validé accepté";
    case "refuse":
      return "refusé";
    default:
      return "en attente";
  }
}

/** Chaîne indexée pour la recherche (tous les champs utiles). */
export function buildProspectSearchHaystack(p: Prospect): { loose: string; compact: string } {
  const parts = [
    p.entreprise,
    p.contactNom,
    p.email,
    p.siteWeb?.replace(/^https?:\/\/(www\.)?/i, ""),
    p.telephone,
    etapeLabel(p.etapeContact),
    reponseLabel(p.reponseClient ?? "en_attente"),
    p.urgent ? "urgent" : "",
    ...(p.notes?.map((n) => n.contenu) ?? []),
    ...(p.rdv?.map((r) => `${r.titre ?? ""} ${r.note ?? ""}`) ?? []),
  ];

  const loose = normalizeSearchText(parts.filter(Boolean).join(" "));
  return { loose, compact: compactSearchText(loose) };
}

const haystackCache = new WeakMap<Prospect, { loose: string; compact: string }>();

function getHaystack(p: Prospect) {
  let h = haystackCache.get(p);
  if (!h) {
    h = buildProspectSearchHaystack(p);
    haystackCache.set(p, h);
  }
  return h;
}

/**
 * Correspondance partielle : « tp » trouve « 3 BTP », sans tenir compte des majuscules.
 * Plusieurs mots : tous doivent matcher (ex. « btp urgent »).
 */
export function prospectMatchesSearch(p: Prospect, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const { loose, compact } = getHaystack(p);
  const qCompact = compactSearchText(query);

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  return tokens.every((token) => {
    if (loose.includes(token)) return true;
    const tCompact = compactSearchText(token);
    return tCompact.length > 0 && compact.includes(tCompact);
  });
}
