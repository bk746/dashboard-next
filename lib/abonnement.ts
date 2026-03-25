import type { AbonnementOffre } from "@/app/types";

/** Offres affichées dans les formulaires (client, devis, facture). */
export const ABONNEMENT_OPTIONS: { value: AbonnementOffre; label: string }[] = [
  { value: "Essentiel", label: "Essentiel" },
  { value: "Performance", label: "Performance" },
  { value: "Croissance", label: "Croissance" },
];

export function normalizeAbonnement(raw: string | undefined): AbonnementOffre {
  if (raw === "Essentiel" || raw === "Performance" || raw === "Croissance") return raw;
  if (raw === "Actif") return "Performance";
  if (raw === "Inactif") return "Essentiel";
  return "Essentiel";
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
