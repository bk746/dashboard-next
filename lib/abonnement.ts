import type { AbonnementOffre } from "@/app/types";

/**
 * Offres : Performance, Essentiel, Aucun, Croissance (même ordre partout : client, devis, facture).
 */
export const ABONNEMENT_OPTIONS: { value: AbonnementOffre; label: string }[] = [
  { value: "Performance", label: "Performance" },
  { value: "Essentiel", label: "Essentiel" },
  { value: "Aucun", label: "Aucun" },
  { value: "Croissance", label: "Croissance" },
];

export function normalizeAbonnement(raw: string | undefined): AbonnementOffre {
  if (raw === "Aucun" || raw === "Essentiel" || raw === "Performance" || raw === "Croissance") return raw;
  if (raw === "Actif") return "Performance";
  if (raw === "Inactif") return "Essentiel";
  if (raw === undefined || raw === "") return "Aucun";
  return "Aucun";
}

/** KPI : clients sur une offre « supérieure » (hors seul Essentiel). */
export function countAbonnementPremiumClients(
  clients: { abonnement?: string }[]
): number {
  return clients.filter((c) => {
    const a = normalizeAbonnement(c.abonnement);
    return a === "Performance" || a === "Croissance";
  }).length;
}
