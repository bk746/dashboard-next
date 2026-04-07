/**
 * Types métier pour le dashboard.
 */

/** Offre d’abonnement (client, devis, facture). « Aucun » = pas d’offre liée. */
export type AbonnementOffre = "Aucun" | "Essentiel" | "Performance" | "Croissance";

export interface Client {
  id: string;
  entreprise: string;
  patron: string;
  telephone: string;
  email: string;
  statut: "Actif" | "Inactif" | "Prospect";
  abonnement?: AbonnementOffre;
  secteurActivite?: string;
  /** CA encaissé : somme des factures payées (recalculé depuis Finance), pas saisi au formulaire client */
  caTotal?: number;
  /** Non saisi dans le formulaire client */
  projets?: { enCours: number; actifs: number; termines: number };
  derniereActivite: string;
}

export interface Facture {
  id: string;
  numeroFacture: string;
  entreprise: string;
  statut: "Payé" | "Non payé";
  date: string;
  prix: number;
  abonnement: AbonnementOffre;
}

export interface PrestationDevis {
  designation: string;
  prix: number;
  /** Ligne détail « inclus dans le forfait » : libellé seul, colonne montant affiche « Inclus ». */
  inclusForfait?: boolean;
}

export interface Devis {
  id: string;
  numeroDevis: string;
  entreprise: string;
  statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé";
  date: string;
  prix: number;
  prestations?: PrestationDevis[];
  validite?: string;
  abonnement: AbonnementOffre;
}

export interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
}

export interface Projet {
  id: string;
  nom: string;
  entreprise: string;
  statut: "Actif" | "Prospect" | "Terminé";
  valeur: number;
  dateDebut: string;
  dateFin: string;
  responsable: string;
  commentaire: string;
}

/** Récurrent = tous les mois, Occasionnel = une fois */
export interface Depense {
  id: string;
  libelle: string;
  montant: number;
  type: "Récurrent" | "Occasionnel";
  date?: string; // pour occasionnel, date de la dépense
}

/** Surcharges tarifaires par ligne (estimateur) */
export interface EstimationTarifOverride {
  price?: number;
  pricePerUnit?: number;
  priceMin?: number;
  priceMax?: number;
}

/** Estimation enregistrée, liée à un client (localStorage) */
export interface EstimationSaved {
  id: string;
  clientId: string;
  /** Libellé optionnel (ex. nom de projet) */
  libelle?: string;
  createdAt: string;
  updatedAt: string;
  selected: Record<string, boolean>;
  qty: Record<string, number>;
  ranges: Record<string, number>;
  maintenanceId: string | null;
  overrides: Record<string, EstimationTarifOverride>;
  maintOverrides: Record<string, number>;
}
