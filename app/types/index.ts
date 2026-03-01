/**
 * Types métier pour le dashboard.
 */

export interface Client {
  id: string;
  entreprise: string;
  patron: string;
  telephone: string;
  email: string;
  statut: "Actif" | "Inactif" | "Prospect";
  abonnement?: "Actif" | "Inactif";
  caTotal: number;
  projets: { enCours: number; actifs: number; termines: number };
  derniereActivite: string;
}

export interface Facture {
  id: string;
  numeroFacture: string;
  entreprise: string;
  statut: "Payé" | "Non payé";
  date: string;
  prix: number;
  abonnement: "Actif" | "Inactif";
}

export interface PrestationDevis {
  designation: string;
  prix: number;
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
  abonnement: "Actif" | "Inactif";
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
