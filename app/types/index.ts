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
  /** Acompte déjà versé (facture non soldée). Reste à payer = prix − montantAcompte. */
  montantAcompte?: number;
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

/** Période sur laquelle la cible et le « réalisé » sont comparés (défaut : année civile). */
export type ObjectifPeriode = "annee" | "mois" | "semaine";

export interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
  /** Absent = année (rétrocompatibilité). */
  periode?: ObjectifPeriode;
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
/** Pipeline commercial — prospection (hors fiche client classique). */
/** Où vous en êtes dans les échanges (un seul choix). */
export type ProspectEtapeContact = "aucun" | "audit_envoye" | "mail_envoye" | "appel_passe";

/** Réponse du prospect — par défaut « en attente » tant que vous ne validez ni ne refusez. */
export type ProspectReponseClient = "en_attente" | "valide" | "refuse";

export type ProspectNoteType =
  | "mail"
  | "appel"
  | "audit"
  | "relance_mail"
  | "relance_appel"
  | "rdv"
  | "autre";

export interface ProspectNote {
  id: string;
  /** ISO */
  createdAt: string;
  type: ProspectNoteType;
  contenu: string;
}

export interface ProspectRdv {
  id: string;
  /** ISO datetime */
  debut: string;
  titre?: string;
  note?: string;
}

/** Modèle d’audit : pondération et suggestions adaptées au secteur. */
export type AuditVisuelTemplate = "generique" | "btp" | "artisan" | "service_local";

export interface AuditVisuelChecklist {
  designDate: boolean;
  ctaAbsent: boolean;
  hierarchie: boolean;
  reassurance: boolean;
  responsive: boolean;
  structure: boolean;
  seoLocal: boolean;
  performancePerdue: boolean;
}

export interface AuditVisuelGenerated {
  noteSur100: number;
  labelNote: string;
  faiblessesPrincipales: string[];
  syntheseCourte: string;
  synthesePremium: string;
  argumentsCommerciaux: string[];
  prioritesRefonte: string[];
}

/** Audit visuel enregistré sur la fiche prospect (Finance → Audit visuel ou formulaire prospect). */
export interface AuditVisuelDossier {
  template: AuditVisuelTemplate;
  checklist: AuditVisuelChecklist;
  generated: AuditVisuelGenerated;
  /** ISO */
  updatedAt: string;
}

/** Historique des audits (bucket `audits-visuels`) — autonome ou lié à un prospect (`prospect-${id}`). */
export interface AuditVisuelRecord {
  id: string;
  prospectId?: string;
  /** Titre affiché (entreprise, nom du site, libellé libre). */
  titre: string;
  siteWeb?: string;
  dossier: AuditVisuelDossier;
  createdAt: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  entreprise: string;
  contactNom?: string;
  email?: string;
  /** URL du site (affichée sous l’e-mail, lien cliquable). */
  siteWeb?: string;
  /** Site critique : affiché avec un repère rouge à côté du nom. */
  urgent?: boolean;
  telephone?: string;
  etapeContact: ProspectEtapeContact;
  reponseClient: ProspectReponseClient;
  /** @deprecated Ancien champ — migré automatiquement vers etapeContact / reponseClient */
  statut?: string;
  /** Date à laquelle l’audit personnalisé a été envoyé (relances J+3 mail, J+7 appel). Format yyyy-mm-dd */
  dateAuditPersoEnvoye?: string;
  /** Date du mail correspondant à l’étape « Mail envoyé » (pas forcément la relance J+3). Format yyyy-mm-dd */
  dateMailEnvoye?: string;
  /** Date de l’appel correspondant à l’étape « Appel passé ». Format yyyy-mm-dd */
  dateAppelPasse?: string;
  relanceMailJ3Fait: boolean;
  /** Date d’envoi du mail de relance (J+3) — sert au délai d’1 semaine avant l’appel. Format yyyy-mm-dd */
  dateRelanceMailEnvoye?: string;
  relanceAppelSemaineFait: boolean;
  notes: ProspectNote[];
  rdv: ProspectRdv[];
  /** Audit visuel rapide (checklist + textes générés), optionnel. */
  auditVisuel?: AuditVisuelDossier;
  createdAt: string;
  updatedAt: string;
}

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
