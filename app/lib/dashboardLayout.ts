/** Blocs configurables du dashboard (cartes du site + navigation). */
export type DashboardWidgetId =
  | "quickLinks"
  | "financeHint"
  | "kpiCa"
  | "kpiClients"
  | "kpiObjectif"
  | "chartEvolutionCa"
  | "chartActiviteClients"
  | "cardTotalClients"
  | "cardActiviteMois"
  | "cardAbonnementsActifs"
  | "cardRevenueEncaisse"
  | "cardEnAttente"
  | "cardEnRetard"
  | "cardDepenses"
  | "cardSyntheseNette"
  | "cardValeurPipeline"
  | "cardProjetsEnCours"
  | "cardProchaineEcheance"
  | "devisKpiStrip"
  | "cardRdvProspection"
  | "cardProspectsEnCours"
  | "cardAuditProspection"
  | "cardRelanceProspection"
  | "cardProgressionObjectifs";

/** Bloc hero en tête : graphique CA + KPI CA / clients actifs à droite. */
export const HERO_WIDGET_IDS: DashboardWidgetId[] = ["chartEvolutionCa", "kpiCa", "kpiClients"];

/** Affichage par défaut (7 blocs initiaux du dashboard) — les autres cartes sont masquées jusqu’à activation. */
export const CORE_DASHBOARD_WIDGET_IDS: DashboardWidgetId[] = [
  "chartEvolutionCa",
  "kpiCa",
  "kpiClients",
  "quickLinks",
  "kpiObjectif",
  "chartActiviteClients",
];

export const TOP_WIDGET_IDS: DashboardWidgetId[] = ["quickLinks", "kpiObjectif"];

export const CHART_WIDGET_IDS: DashboardWidgetId[] = ["chartEvolutionCa", "chartActiviteClients"];

/** Cartes type KPI (grille 1–3 colonnes), hors pleine largeur. */
export const KPI_GRID_WIDGET_IDS: DashboardWidgetId[] = [
  "kpiCa",
  "kpiClients",
  "cardTotalClients",
  "cardActiviteMois",
  "cardAbonnementsActifs",
  "cardRevenueEncaisse",
  "cardEnAttente",
  "cardEnRetard",
  "cardDepenses",
  "cardSyntheseNette",
  "cardValeurPipeline",
  "cardProjetsEnCours",
  "cardProchaineEcheance",
  "cardProspectsEnCours",
  "cardAuditProspection",
  "cardRelanceProspection",
  "cardProgressionObjectifs",
];

export const FULL_WIDTH_WIDGET_IDS: DashboardWidgetId[] = ["cardRdvProspection", "devisKpiStrip"];

export const ALL_DASHBOARD_WIDGET_IDS: DashboardWidgetId[] = [
  "quickLinks",
  "financeHint",
  "kpiCa",
  "kpiClients",
  "kpiObjectif",
  "chartEvolutionCa",
  "chartActiviteClients",
  "cardTotalClients",
  "cardActiviteMois",
  "cardAbonnementsActifs",
  "cardRevenueEncaisse",
  "cardEnAttente",
  "cardEnRetard",
  "cardDepenses",
  "cardSyntheseNette",
  "cardValeurPipeline",
  "cardProjetsEnCours",
  "cardProchaineEcheance",
  "devisKpiStrip",
  "cardRdvProspection",
  "cardProspectsEnCours",
  "cardAuditProspection",
  "cardRelanceProspection",
  "cardProgressionObjectifs",
];

function dedupeOrder(ids: DashboardWidgetId[]): DashboardWidgetId[] {
  const seen = new Set<DashboardWidgetId>();
  const out: DashboardWidgetId[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export interface DashboardLayoutPrefs {
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
}

export function defaultDashboardLayoutPrefs(): DashboardLayoutPrefs {
  const order = dedupeOrder([...CORE_DASHBOARD_WIDGET_IDS, ...ALL_DASHBOARD_WIDGET_IDS]);
  return {
    order,
    hidden: ALL_DASHBOARD_WIDGET_IDS.filter((id) => !CORE_DASHBOARD_WIDGET_IDS.includes(id)),
  };
}

const LEGACY_WIDGET_ID_MAP: Record<string, DashboardWidgetId> = {
  cardRelanceMailProspection: "cardRelanceProspection",
  cardRelanceAppelProspection: "cardRelanceProspection",
};

function isWidgetId(id: unknown): id is DashboardWidgetId {
  return typeof id === "string" && ALL_DASHBOARD_WIDGET_IDS.includes(id as DashboardWidgetId);
}

function resolveWidgetId(id: unknown): DashboardWidgetId | null {
  if (typeof id !== "string") return null;
  if (isWidgetId(id)) return id;
  return LEGACY_WIDGET_ID_MAP[id] ?? null;
}

export function normalizeDashboardLayoutPrefs(raw: unknown): DashboardLayoutPrefs {
  const def = defaultDashboardLayoutPrefs();
  if (!raw || typeof raw !== "object") return def;
  const o = raw as Partial<DashboardLayoutPrefs>;
  const orderIn = Array.isArray(o.order)
    ? o.order
        .map(resolveWidgetId)
        .filter((id): id is DashboardWidgetId => id != null)
        .map((id) => (id === "financeHint" ? "kpiObjectif" : id))
    : [];
  const hiddenIn = Array.isArray(o.hidden) ? o.hidden.map(resolveWidgetId).filter((id): id is DashboardWidgetId => id != null) : [];
  if (orderIn.length === 0) return def;
  const seen = new Set<DashboardWidgetId>();
  const order: DashboardWidgetId[] = [];
  for (const id of orderIn) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  const hiddenSet = new Set(hiddenIn);
  const savedOrderIds = new Set(orderIn);
  for (const id of ALL_DASHBOARD_WIDGET_IDS) {
    if (!seen.has(id)) {
      order.push(id);
      hiddenSet.add(id);
    } else if (!savedOrderIds.has(id)) {
      hiddenSet.add(id);
    }
  }
  return {
    order,
    hidden: ALL_DASHBOARD_WIDGET_IDS.filter((id) => hiddenSet.has(id)),
  };
}

export const DASHBOARD_WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  quickLinks: "Liens rapides",
  financeHint: "Alerte factures impayées",
  kpiCa: "CA du mois (dashboard)",
  kpiClients: "Clients actifs (dashboard)",
  kpiObjectif: "Objectif financier (dashboard)",
  chartEvolutionCa: "Graphique évolution du CA (12 mois)",
  chartActiviteClients: "Graphique activité clients (12 mois)",
  cardTotalClients: "[Clients] Total clients",
  cardActiviteMois: "[Clients] Activité ce mois",
  cardAbonnementsActifs: "[Clients] Abonnements actifs",
  cardRevenueEncaisse: "[Finance] Revenu encaissé (mois)",
  cardEnAttente: "[Finance] Montant en attente (mois)",
  cardEnRetard: "[Finance] Montant en retard",
  cardDepenses: "[Finance] Dépenses (mois)",
  cardSyntheseNette: "[Finance] Synthèse nette (mois)",
  cardValeurPipeline: "[Deals] Valeur pipeline",
  cardProjetsEnCours: "[Deals] Projets en cours",
  cardProchaineEcheance: "[Deals] Prochaine échéance",
  devisKpiStrip: "[Finance] Vue d’ensemble devis (acceptés / pipeline / refus)",
  cardRdvProspection: "[Prospection] Rendez-vous à venir",
  cardProspectsEnCours: "[Prospection] Prospects en cours",
  cardAuditProspection: "[Prospection] Audit à faire",
  cardRelanceProspection: "[Prospection] Relance",
  cardProgressionObjectifs: "[Objectifs] Progression globale",
};

export function isKpiGridWidgetId(id: DashboardWidgetId): boolean {
  return KPI_GRID_WIDGET_IDS.includes(id);
}

export function isChartWidgetId(id: DashboardWidgetId): boolean {
  return CHART_WIDGET_IDS.includes(id);
}

export function isTopWidgetId(id: DashboardWidgetId): boolean {
  return TOP_WIDGET_IDS.includes(id);
}

export function isHeroWidgetId(id: DashboardWidgetId): boolean {
  return HERO_WIDGET_IDS.includes(id);
}

export function isFullWidthWidgetId(id: DashboardWidgetId): boolean {
  return FULL_WIDTH_WIDGET_IDS.includes(id);
}
