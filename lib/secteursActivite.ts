/**
 * Liste de secteurs d’activité pour les fiches client (libellés usuels + nomenclature NAF — sections et divisions courantes).
 * Ordre alphabétique pour la liste déroulante.
 */

export const SECTEUR_ACTIVITE_VIDE = "";
/** Valeur sentinelle pour « saisie libre » dans le select */
export const SECTEUR_ACTIVITE_AUTRE = "__autre__";

const SECTEURS_BRUT = [
  "Activités des organisations et organismes extraterritoriaux",
  "Activités des ménages en tant qu'employeurs de personnel domestique",
  "Activités spécialisées, scientifiques et techniques",
  "Administration publique et défense ; sécurité sociale obligatoire",
  "Agriculture, sylviculture et pêche",
  "Agroalimentaire, transformation alimentaire",
  "Architecture, urbanisme, paysagisme",
  "Arts, spectacles et activités récréatives",
  "Assurance, réassurance, retraite (sauf sécu. obligatoire)",
  "Associations, fondations, organisations syndicales",
  "Autres activités de services",
  "Autres industries manufacturières",
  "Banque, crédit, financement",
  "BTP — gros oeuvre et structure",
  "BTP — second oeuvre, finition, rénovation",
  "BTP — travaux publics et infrastructures",
  "Centres d'appels, permanences téléphoniques",
  "Chimie, parachimie, matériaux",
  "Commerce de détail (hors automobile)",
  "Commerce de gros (interentreprises)",
  "Commerce et réparation d'automobiles et de motocycles",
  "Communication, publicité, relations publiques",
  "Conseil en gestion, stratégie, organisation",
  "Conseil en systèmes et logiciels informatiques",
  "Construction de bâtiments",
  "Coiffure, soins de beauté, esthétique",
  "Culture, patrimoine, bibliothèques, musées",
  "Cultures et élevage (agriculture)",
  "Dépollution, traitement des déchets, recyclage",
  "Distribution spécialisée (bricolage, sport, loisirs, etc.)",
  "Édition, librairie, presse",
  "Électricité, gaz, vapeur et air conditionné",
  "Enseignement, formation continue, CFA",
  "Équipements électriques, électroniques, optique",
  "Études de marché, sondages",
  "Fabrication de machines et équipements",
  "Fabrication de matériel de transport",
  "Fabrication de meubles, industries du bois",
  "Fabrication de produits informatiques et électroniques",
  "Fabrication de produits métalliques",
  "Fabrication de textiles, habillement, cuir",
  "Formation professionnelle, coaching",
  "Grande distribution, hypermarchés, supermarchés",
  "Hébergement médico-social, handicap, dépendance",
  "Hébergement touristique, hôtellerie",
  "Immobilier, promotion, transaction, location",
  "Industrie automobile, équipementiers",
  "Industrie aéronautique et spatiale",
  "Industrie du papier et du carton",
  "Industrie pharmaceutique, biotechnologies",
  "Industries extractives, mines, carrières",
  "Information, édition numérique, jeux vidéo",
  "Ingénierie, études techniques",
  "Installation et maintenance industrielle",
  "Intérim, travail temporaire, recrutement",
  "Justice, notariat, activités juridiques",
  "Logistique, fret, entreposage, messagerie",
  "Métallurgie, fonderie, forge",
  "Nettoyage, propreté, facility management",
  "Organisation d'événements, foires, salons",
  "Photographie, production audiovisuelle",
  "Plastique, caoutchouc, composites",
  "Production et distribution d'eau ; assainissement",
  "Restauration traditionnelle, restauration rapide, traiteur",
  "Santé — cabinets médicaux, paramédical, laboratoires",
  "Santé — cliniques, hôpitaux, établissements de soins",
  "Santé — pharmacies, officines",
  "Sécurité privée, surveillance, gardiennage",
  "Services administratifs et autres soutiens aux entreprises",
  "Services funéraires, pompes funèbres",
  "Services informatiques, hébergement, infogérance",
  "Services juridiques, comptables, de gestion",
  "Sport, clubs, salles de sport",
  "Télécommunications, opérateurs, fournisseurs d'accès",
  "Transports aériens",
  "Transports ferroviaires",
  "Transports maritimes et fluviaux",
  "Transports routiers, déménagement, taxi, VTC",
  "Travaux agricoles, sylvicoles, espaces verts",
  "Vente à distance, e-commerce pur player",
  "Vente et réparation de matériel informatique et télécom",
  "Autre secteur (préciser ci-dessous)",
] as const;

/** Libellés uniques, triés (sauf entrée « Autre » gérée dans le formulaire) */
export const SECTEURS_ACTIVITE_OPTIONS: readonly string[] = [...new Set(SECTEURS_BRUT)]
  .filter((s) => s !== "Autre secteur (préciser ci-dessous)")
  .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

export function isSecteurActiviteInList(value: string): boolean {
  return SECTEURS_ACTIVITE_OPTIONS.includes(value);
}
