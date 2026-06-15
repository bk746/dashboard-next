import type { Prospect } from "@/app/types";
import { emptyProspect } from "@/app/prospection/prospection_utils";
import seedData from "@/app/prospection/iadProspectsSeed.json";

export interface IadProspectSeed {
  slug: string;
  name: string;
  city: string;
  avis: number;
  biens: number;
  telephone: string;
  url: string;
}

const IAD_SEED = seedData as IadProspectSeed[];

export function iadSeedToProspect(item: IadProspectSeed): Prospect {
  const base = emptyProspect();
  const now = new Date().toISOString();
  return {
    ...base,
    id: `iad-74-${item.slug}`,
    entreprise: item.name,
    contactNom: item.city,
    telephone: item.telephone,
    siteWeb: item.url,
    notes: [
      {
        id: `iad-note-${item.slug}`,
        createdAt: now,
        type: "autre",
        contenu: `Prospect IAD 74 — ${item.city} · ${item.biens} biens · ${item.avis} avis IAD`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/** Ajoute les conseillers IAD seed absents (dédoublonnage par URL profil ou id). */
export function mergeIadProspects(existing: Prospect[]): { merged: Prospect[]; added: number } {
  const existingUrls = new Set(
    existing.map((p) => p.siteWeb?.trim()).filter((u): u is string => Boolean(u))
  );
  const existingIds = new Set(existing.map((p) => p.id));

  const toAdd = IAD_SEED.filter(
    (s) => !existingUrls.has(s.url) && !existingIds.has(`iad-74-${s.slug}`)
  ).map(iadSeedToProspect);

  if (toAdd.length === 0) return { merged: existing, added: 0 };
  return { merged: [...existing, ...toAdd], added: toAdd.length };
}

export const IAD_PROSPECTS_SEED_COUNT = IAD_SEED.length;
