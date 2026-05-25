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
/** Statut du contact — appels passés (1 à 4). L’audit (fait / envoyé) est géré à part. */
export type ProspectEtapeContact =
  | "aucun"
  | "appel_passe"
  | "appel_passe_2"
  | "appel_passe_3"
  | "appel_passe_4";

export interface ProspectDatesAppels {
  appel1?: string;
  appel2?: string;
  appel3?: string;
  appel4?: string;
}

/** Réponse du prospect — par défaut « en attente » tant que vous ne validez ni ne refusez. */
export type ProspectReponseClient = "en_attente" | "valide" | "refuse";

export type ProspectRelanceCanal = "appel" | "mail";

export interface ProspectRelanceSansReponse {
  /** Date de la tentative (yyyy-mm-dd) */
  date: string;
  canal: ProspectRelanceCanal;
}

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
  /** Date à laquelle l’audit a été réalisé (suivi interne). Format yyyy-mm-dd */
  dateAuditFait?: string;
  /** Date à laquelle l’audit a été envoyé au prospect. Format yyyy-mm-dd */
  dateAuditEnvoye?: string;
  /** @deprecated Migré vers dateAuditFait */
  dateAuditPersoEnvoye?: string;
  /** Dates des appels (yyyy-mm-dd), selon le statut contact. */
  datesAppels?: ProspectDatesAppels;
  /** @deprecated Migré vers datesAppels.appel1 */
  dateMailEnvoye?: string;
  /** @deprecated Migré vers datesAppels.appel1 */
  dateAppelPasse?: string;
  /** Tentatives sans réponse (chaque entrée repousse la relance de 3 jours ouvrés). */
  relancesSansReponse?: ProspectRelanceSansReponse[];
  /** Prochaine relance à effectuer (yyyy-mm-dd, jours ouvrés uniquement pour le calcul). */
  dateProchaineRelance?: string;
  /** @deprecated Ancien flux — migré vers relancesSansReponse / dateProchaineRelance */
  relanceMailJ3Fait?: boolean;
  /** @deprecated */
  dateRelanceMailEnvoye?: string;
  /** @deprecated */
  relanceAppelSemaineFait?: boolean;
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
