import type { Facture, Prospect } from "@/app/types";
import { getResteAPayerFacture, isFactureEnRetard } from "@/app/finance/utils";
import { besoinRelance, migrateProspect } from "@/app/prospection/prospection_utils";

export interface PushDigest {
  facturesEnRetard: number;
  montantEnRetard: number;
  relancesAFaire: number;
}

export function computePushDigest(factures: Facture[], prospects: Prospect[]): PushDigest | null {
  const enRetard = factures.filter((f) => isFactureEnRetard(f));
  const relances = prospects
    .map((p) => migrateProspect(p))
    .filter((p) => besoinRelance(p));

  if (enRetard.length === 0 && relances.length === 0) return null;

  return {
    facturesEnRetard: enRetard.length,
    montantEnRetard: enRetard.reduce((s, f) => s + getResteAPayerFacture(f), 0),
    relancesAFaire: relances.length,
  };
}

export function digestKey(d: PushDigest): string {
  return `${d.facturesEnRetard}:${d.montantEnRetard}:${d.relancesAFaire}`;
}

export function formatPushPayload(digest: PushDigest): {
  title: string;
  body: string;
  url: string;
} {
  const parts: string[] = [];
  if (digest.facturesEnRetard > 0) {
    parts.push(
      `${digest.facturesEnRetard} facture${digest.facturesEnRetard > 1 ? "s" : ""} en retard (${digest.montantEnRetard.toLocaleString("fr-FR")} €)`
    );
  }
  if (digest.relancesAFaire > 0) {
    parts.push(
      `${digest.relancesAFaire} relance${digest.relancesAFaire > 1 ? "s" : ""} prospection`
    );
  }

  const url =
    digest.facturesEnRetard > 0 && digest.relancesAFaire === 0
      ? "/finance"
      : digest.relancesAFaire > 0 && digest.facturesEnRetard === 0
        ? "/prospection"
        : "/dashboard";

  return {
    title: "BK Copilot",
    body: parts.join(" · "),
    url,
  };
}
