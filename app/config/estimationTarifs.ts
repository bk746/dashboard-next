/**
 * Grille tarifaire pour l'estimateur — modifiez les montants ici.
 * Les `id` servent au suivi des sélections ; les renommer casse les anciennes sélections en base locale.
 */

export type TarifKind = "fixed" | "perUnit" | "range" | "included" | "monthly";

export interface EstimationItem {
  id: string;
  label: string;
  /** À quoi correspond cette ligne (affiché sous le libellé) */
  description?: string;
  /**
   * Si cette ligne est cochée et facturée, ces libellés apparaissent en plus dans le devis
   * (lignes à 0 € « Inclus — … ») pour détailer le forfait.
   */
  devisInclusions?: string[];
  /**
   * Couvert par le forfait « Site vitrine (1 à 5 pages) » : affichage « inclus » et pas de double facturation
   * si ce forfait est coché.
   */
  includedWithVitrineForfait?: boolean;
  /**
   * Option à 0 € avec case à cocher : si cochée, apparaît au devis avec statut « Inclus » (sans doubler le total).
   */
  inclusAuDevis?: boolean;
  price?: number;
  pricePerUnit?: number;
  unitLabel?: string;
  minQty?: number;
  maxQty?: number;
  priceMin?: number;
  priceMax?: number;
  kind: TarifKind;
  note?: string;
}

export interface EstimationCategory {
  id: string;
  emoji: string;
  title: string;
  /** Rôle du module dans l'estimation */
  description?: string;
  items: EstimationItem[];
}

export const estimationCategories: EstimationCategory[] = [
  {
    id: "vitrine",
    emoji: "📄",
    title: "Site vitrine & pages",
    description:
      "Sites de présentation, pages institutionnelles et acquisition (hors vente en ligne complexe).",
    items: [
      {
        id: "vitrine-1-5",
        label: "Site vitrine (1 à 5 pages)",
        description:
          "Structure classique : accueil, offre, à propos, contact, etc. Forfait incluant formulaire simple, optimisation des performances, sauvegarde sécurisée, mise en ligne et formation. Contenu fourni par le client sauf option rédaction.",
        kind: "fixed",
        price: 2000,
        devisInclusions: [
          "Formulaire de contact simple",
          "Optimisation des performances",
          "Sauvegarde sécurisée",
          "Mise en ligne",
          "Formation à l’administration du site",
        ],
      },
      {
        id: "page-extra",
        label: "Page supplémentaire",
        description: "Chaque page au-delà du forfait de base (même gabarit ou maquette dérivée).",
        kind: "perUnit",
        pricePerUnit: 200,
        unitLabel: "page",
        minQty: 0,
        maxQty: 50,
      },
      {
        id: "landing",
        label: "Landing page",
        description: "Une page unique orientée conversion (campagne, lancement produit, inscription).",
        kind: "fixed",
        price: 800,
      },
      {
        id: "refonte",
        label: "Refonte de site existant",
        description: "Reprise du contenu, nouvelle structure, design et mise en ligne en remplacement d’un site actuel.",
        kind: "range",
        priceMin: 1500,
        priceMax: 3500,
      },
    ],
  },
  {
    id: "ecommerce",
    emoji: "🛒",
    title: "E-commerce",
    description: "Boutique en ligne avec catalogue, panier et paiement (Stripe, PayPal, etc. selon intégration).",
    items: [
      {
        id: "boutique-simple",
        label: "Boutique simple",
        description: "Peu de références, paiement standard, back-office pour gérer commandes et produits.",
        kind: "fixed",
        price: 3500,
      },
      {
        id: "boutique-avancee",
        label: "Boutique avancée",
        description: "Nombreux produits, variantes, règles de livraison/TVA, scénarios d’achat plus poussés.",
        kind: "range",
        priceMin: 5000,
        priceMax: 8000,
      },
      {
        id: "produit-extra",
        label: "Produit au catalogue (au-delà du forfait)",
        description: "Fiche produit enrichie (texte, images, options) facturée au volume si gros catalogue.",
        kind: "perUnit",
        pricePerUnit: 5,
        unitLabel: "produit",
        minQty: 0,
        maxQty: 500,
      },
      {
        id: "tunnel-conversion",
        label: "Tunnel de commande & checkout",
        description: "Parcours panier → paiement optimisé, réassurance, emails transactionnels de base.",
        kind: "fixed",
        price: 600,
      },
    ],
  },
  {
    id: "surmesure",
    emoji: "🧠",
    title: "Sur-mesure & applications",
    description: "Logique métier spécifique, espaces connectés et outils internes (au-delà d’un site vitrine).",
    items: [
      {
        id: "projet-surmesure",
        label: "Projet sur-mesure (site/app)",
        description: "Arborescence et fonctionnalités uniques, intégrations sur mesure.",
        kind: "range",
        priceMin: 5000,
        priceMax: 10000,
      },
      {
        id: "webapp-simple",
        label: "Application web (outil métier)",
        description: "Interface connectée pour un usage interne ou client (tableaux de bord, workflows).",
        kind: "range",
        priceMin: 6000,
        priceMax: 15000,
      },
      {
        id: "dashboard-admin",
        label: "Back-office / administration",
        description: "Gestion des contenus, utilisateurs ou données côté admin.",
        kind: "fixed",
        price: 1200,
      },
      {
        id: "espace-client",
        label: "Espace client (compte)",
        description: "Historique de commandes, documents, profil utilisateur.",
        kind: "fixed",
        price: 1000,
      },
      {
        id: "auth",
        label: "Authentification (connexion sécurisée)",
        description: "Inscription, connexion, réinitialisation mot de passe, rôles si besoin.",
        kind: "fixed",
        price: 500,
      },
      {
        id: "api-auto",
        label: "API & automatisation",
        description: "Échanges avec un CRM, outil interne, webhooks, scripts récurrents.",
        kind: "range",
        priceMin: 500,
        priceMax: 1000,
      },
    ],
  },
  {
    id: "design",
    emoji: "🎨",
    title: "Design & identité",
    description: "Niveau de personnalisation visuelle et d’expérience utilisateur.",
    items: [
      {
        id: "design-personnalise",
        label: "Design personnalisé",
        description:
          "Interface et identité visuelle créées pour votre projet — pas de thème WordPress / gabarit générique, mise en page et composants sur mesure.",
        kind: "fixed",
        price: 0,
        inclusAuDevis: true,
      },
      {
        id: "design-surmesure",
        label: "Design sur-mesure (maquettes dédiées)",
        description: "Écrans uniques alignés sur la charte, pas un thème générique.",
        kind: "fixed",
        price: 600,
      },
      {
        id: "uiux-avance",
        label: "UX / parcours avancé",
        description: "Ateliers, wireframes détaillés, priorisation des parcours critiques.",
        kind: "fixed",
        price: 800,
      },
      {
        id: "anim-pack",
        label: "Animations & micro-interactions",
        description: "Mouvements légers, feedback au survol, transitions pour rendre l’interface plus vivante.",
        kind: "fixed",
        price: 400,
      },
      {
        id: "direction-art",
        label: "Direction artistique",
        description: "Proposition graphique globale (univers, iconographie, cohérence multi-supports).",
        kind: "fixed",
        price: 1200,
      },
      {
        id: "figma-proto",
        label: "Prototype cliquable (Figma)",
        description: "Maquette interactive pour valider avant développement.",
        kind: "fixed",
        price: 300,
      },
    ],
  },
  {
    id: "contenu",
    emoji: "✍️",
    title: "Contenu & rédaction",
    description: "Textes et narration : utile si le client ne fournit pas tout le contenu prêt à intégrer.",
    items: [
      {
        id: "redac-simple",
        label: "Rédaction de pages (standard)",
        description: "Textes clairs à partir de brief ou points fournis par le client.",
        kind: "fixed",
        price: 200,
      },
      {
        id: "copywriting",
        label: "Copywriting marketing",
        description: "Accroches, pages de vente, ton de marque orienté conversion.",
        kind: "fixed",
        price: 400,
      },
      {
        id: "storytelling",
        label: "Storytelling & offre structurée",
        description: "Narration de la marche à suivre, preuves, structure argumentative complète.",
        kind: "fixed",
        price: 600,
      },
    ],
  },
  {
    id: "formulaires",
    emoji: "🧾",
    title: "Formulaires & leads",
    description: "Collecte de demandes : du simple contact aux parcours qualifiés.",
    items: [
      {
        id: "form-contact",
        label: "Formulaire de contact simple",
        description: "Nom, email, message — envoi par email ou enregistrement basique.",
        kind: "fixed",
        price: 100,
        includedWithVitrineForfait: true,
      },
      {
        id: "form-qualifie",
        label: "Formulaire devis / qualification",
        description: "Champs structurés (budget, besoin, secteur) pour filtrer les leads.",
        kind: "fixed",
        price: 250,
      },
      {
        id: "form-avance",
        label: "Formulaire multi-étapes & pièces jointes",
        description: "Plusieurs étapes, upload de fichiers, validation avancée, envoi sécurisé.",
        kind: "fixed",
        price: 450,
      },
    ],
  },
  {
    id: "integrations",
    emoji: "🔗",
    title: "Intégrations",
    description: "Connexion avec des outils tiers (analytics, CRM, prise de rendez-vous, paiement).",
    items: [
      {
        id: "calendly",
        label: "Prise de rendez-vous (Calendly, etc.)",
        description: "Lien ou embed pour réserver un créneau depuis le site.",
        kind: "fixed",
        price: 200,
      },
      {
        id: "ga",
        label: "Mesure d’audience (GA4 ou équivalent)",
        description: "Installation du tag, événements de base, lien avec la propriété du client.",
        kind: "fixed",
        price: 0,
        inclusAuDevis: true,
      },
      {
        id: "pixel-meta",
        label: "Pixel publicitaire (Meta, etc.)",
        description: "Connexion compte pub pour remarketing et mesure des campagnes.",
        kind: "fixed",
        price: 100,
      },
      {
        id: "paiement-stripe",
        label: "Paiement en ligne (Stripe / lien)",
        description: "Paiement ponctuel ou abonnement simple hors grosse boutique (ex. prestation, adhésion).",
        kind: "fixed",
        price: 350,
      },
      {
        id: "crm",
        label: "CRM (HubSpot, etc.)",
        description: "Synchronisation des leads ou contacts vers l’outil du client.",
        kind: "fixed",
        price: 300,
      },
      {
        id: "newsletter",
        label: "Newsletter / emailing",
        description: "Inscription, synchro avec Brevo, Mailchimp ou équivalent.",
        kind: "fixed",
        price: 200,
      },
      {
        id: "chat",
        label: "Chat (widget)",
        description: "Crisp, Intercom, Tawk… pour répondre en direct sur le site.",
        kind: "fixed",
        price: 150,
      },
    ],
  },
  {
    id: "perf-seo",
    emoji: "⚡",
    title: "Performance & SEO",
    description: "Vitesse perçue, référencement naturel et visibilité locale — souvent décisif pour le trafic.",
    items: [
      {
        id: "perf-globale",
        label: "Optimisation performance (vitesse, images, mobile)",
        description: "Compression, formats modernes, cache, correctifs LCP/CLS, aligné avec un bon score Lighthouse.",
        kind: "fixed",
        price: 450,
        includedWithVitrineForfait: true,
      },
      {
        id: "seo-essentiel",
        label: "SEO essentiel (on-page)",
        description: "Titres, meta, structure Hn, maillage interne de base, sitemap, soumission indexation.",
        kind: "fixed",
        price: 450,
      },
      {
        id: "seo-avance",
        label: "SEO avancé",
        description: "Stratégie de contenus, maillage poussé, suivi positions, recommandations techniques.",
        kind: "fixed",
        price: 800,
      },
      {
        id: "seo-local",
        label: "SEO local (fiche Google Business, cohérence NAP)",
        description: "Visibilité pour recherches géolocalisées et annuaires.",
        kind: "fixed",
        price: 500,
      },
      {
        id: "seo-redac-page",
        label: "Rédaction SEO par page ciblée",
        description: "Texte optimisé pour une requête précise (mot-clé + intention).",
        kind: "perUnit",
        pricePerUnit: 100,
        unitLabel: "page",
        minQty: 0,
        maxQty: 100,
      },
    ],
  },
  {
    id: "securite",
    emoji: "🔒",
    title: "Sécurité & conformité",
    description: "Protection du site et respect du cadre légal (RGPD, cookies).",
    items: [
      {
        id: "https",
        label: "HTTPS (certificat SSL)",
        description: "Connexion chiffrée entre le navigateur et le serveur — standard sur tout nouveau site.",
        kind: "included",
        note: "inclus",
      },
      {
        id: "backup",
        label: "Sauvegardes automatiques",
        description: "Copies planifiées pour restaurer en cas de erreur ou piratage.",
        kind: "fixed",
        price: 100,
        includedWithVitrineForfait: true,
      },
      {
        id: "sec-avance",
        label: "Durcissement sécurité",
        description: "En-têtes HTTP, limitation tentatives, bonnes pratiques OWASP pour le stack utilisé.",
        kind: "fixed",
        price: 300,
        includedWithVitrineForfait: true,
      },
      {
        id: "rgpd-basique",
        label: "Pack RGPD (cookies + mentions légales)",
        description: "Bandeau cookies paramétré, pages légales type, liens vers politique de confidentialité.",
        kind: "fixed",
        price: 350,
      },
    ],
  },
  {
    id: "fonctionnalites",
    emoji: "🧩",
    title: "Fonctionnalités métier",
    description: "Modules récurrents en plus du cœur du site.",
    items: [
      {
        id: "blog",
        label: "Blog / actualités",
        description: "Liste d’articles avec catégories, auteur, SEO de base par article.",
        kind: "fixed",
        price: 300,
      },
      {
        id: "avis",
        label: "Avis clients (intégration)",
        description: "Affichage d’avis Google ou autre source sur le site.",
        kind: "fixed",
        price: 200,
      },
      {
        id: "multilangue",
        label: "Site multilingue",
        description: "Traductions fournies par le client, structure par langue, hreflang.",
        kind: "fixed",
        price: 500,
      },
      {
        id: "geo",
        label: "Carte & géolocalisation",
        description: "Points sur une carte, recherche par zone ou itinéraire.",
        kind: "fixed",
        price: 300,
      },
      {
        id: "reservation",
        label: "Réservation / prise de créneaux",
        description: "Hors simple Calendly : logique métier (créneaux, ressources, annulation).",
        kind: "fixed",
        price: 500,
      },
      {
        id: "espace-membre",
        label: "Espace membre (contenu réservé)",
        description: "Contenus ou tarifs visibles seulement après connexion.",
        kind: "fixed",
        price: 1000,
      },
    ],
  },
  {
    id: "mise-en-ligne",
    emoji: "🧰",
    title: "Mise en ligne & noms de domaine",
    description: "Une fois le site prêt : domaine, hébergement, emails et déploiement.",
    items: [
      {
        id: "pack-lancement",
        label: "Pack lancement (domaine + DNS + déploiement)",
        description: "Achat ou rattachement du domaine, zone DNS, mise en production sur l’hébergeur cible.",
        kind: "fixed",
        price: 120,
        includedWithVitrineForfait: true,
      },
      {
        id: "email-pro",
        label: "Boîtes email pro (configuration)",
        description: "Comptes type contact@ sur le domaine (Google Workspace, Microsoft, ou hébergeur).",
        kind: "fixed",
        price: 150,
      },
    ],
  },
  {
    id: "formation",
    emoji: "🎓",
    title: "Formation & transfert",
    description: "Pour que le client soit autonome sur le quotidien (contenus, petites modifs).",
    items: [
      {
        id: "formation-1h",
        label: "Session de prise en main (1 h)",
        description: "Visio : navigation admin, mise à jour des textes, bonnes pratiques.",
        kind: "fixed",
        price: 150,
        includedWithVitrineForfait: true,
      },
      {
        id: "doc-livrable",
        label: "Documentation courte (PDF / Notion)",
        description: "Guide des étapes récurrentes (publier un article, changer une bannière).",
        kind: "fixed",
        price: 200,
      },
    ],
  },
  {
    id: "business",
    emoji: "🚀",
    title: "Conseil & croissance",
    description: "Prestations ponctuelles d’analyse et d’expérimentation — en complément du livrable.",
    items: [
      {
        id: "audit-ux",
        label: "Audit UX (parcours & friction)",
        description: "Revue des écrans clés et recommandations priorisées.",
        kind: "fixed",
        price: 300,
      },
      {
        id: "audit-seo",
        label: "Audit SEO technique & contenu",
        description: "Crawl, indexation, quick wins et feuille de route.",
        kind: "fixed",
        price: 300,
      },
      {
        id: "opt-conversion",
        label: "Optimisation du taux de conversion (CRO)",
        description: "Hypothèses, mesure, pistes d’amélioration sur les pages clés.",
        kind: "fixed",
        price: 500,
      },
      {
        id: "ab-test",
        label: "Mise en place A/B testing",
        description: "Outil type Google Optimize / équivalent, variantes et suivi des objectifs.",
        kind: "fixed",
        price: 300,
      },
    ],
  },
];

/** Maintenance : un seul forfait au choix (€/mois) */
export const maintenancePlans: {
  id: string;
  label: string;
  priceMonthly: number;
  description?: string;
}[] = [
  {
    id: "maint-basique",
    label: "Basique",
    priceMonthly: 39,
    description: "Mises à jour mineures (texte, image), veille de disponibilité, petits correctifs.",
  },
  {
    id: "maint-standard",
    label: "Standard",
    priceMonthly: 79,
    description: "Inclut le basique + évolutions légères, sauvegardes, priorité sur les tickets.",
  },
  {
    id: "maint-premium",
    label: "Premium",
    priceMonthly: 149,
    description: "Accompagnement serré, évolutions régulières, conseil technique et petits développements.",
  },
];

export function defaultRangeValue(item: EstimationItem): number {
  if (item.kind !== "range" || item.priceMin == null || item.priceMax == null) return 0;
  return Math.round((item.priceMin + item.priceMax) / 2);
}
