import type {
  AuditVisuelChecklist,
  AuditVisuelGenerated,
  AuditVisuelTemplate,
} from "@/app/types";

export type AuditVisuelCritereKey = keyof AuditVisuelChecklist;

export const AUDIT_TEMPLATE_LABELS: { value: AuditVisuelTemplate; label: string; hint: string }[] = [
  { value: "generique", label: "Générique", hint: "Pondération équilibrée sur tous les critères." },
  { value: "btp", label: "BTP / travaux", hint: "Mise en avant réassurance, chantiers, SEO local." },
  { value: "artisan", label: "Artisan", hint: "CTA, preuves et proximité renforcés." },
  { value: "service_local", label: "Service local", hint: "SEO local, confiance et rapidité perçue." },
];

const CRITERES: {
  key: AuditVisuelCritereKey;
  label: string;
  court: string;
  base: number;
}[] = [
  { key: "designDate", label: "Design daté", court: "identité visuelle datée", base: 11 },
  { key: "ctaAbsent", label: "CTA absent ou peu visible", court: "calls-to-action absents", base: 14 },
  { key: "hierarchie", label: "Mauvaise hiérarchie visuelle", court: "hiérarchie visuelle faible", base: 12 },
  { key: "reassurance", label: "Faible réassurance", court: "éléments de réassurance insuffisants", base: 13 },
  { key: "responsive", label: "Responsive faible", court: "expérience mobile perfectible", base: 12 },
  { key: "structure", label: "Structure confuse", court: "structure des contenus confuse", base: 11 },
  { key: "seoLocal", label: "SEO local faible", court: "visibilité locale limitée", base: 14 },
  { key: "performancePerdue", label: "Performance perçue faible", court: "vitesse et fluidité perçues faibles", base: 13 },
];

const SUM_BASE = CRITERES.reduce((a, c) => a + c.base, 0);

function multFor(template: AuditVisuelTemplate, key: AuditVisuelCritereKey): number {
  const m: Record<AuditVisuelTemplate, Partial<Record<AuditVisuelCritereKey, number>>> = {
    generique: {},
    btp: { reassurance: 1.28, seoLocal: 1.32, structure: 1.12, designDate: 1.08 },
    artisan: { ctaAbsent: 1.22, reassurance: 1.26, seoLocal: 1.24, responsive: 1.1 },
    service_local: {
      seoLocal: 1.38,
      reassurance: 1.22,
      performancePerdue: 1.15,
      ctaAbsent: 1.1,
    },
  };
  return m[template][key] ?? 1;
}

function poidsEffectifs(template: AuditVisuelTemplate): Record<AuditVisuelCritereKey, number> {
  const raw: Partial<Record<AuditVisuelCritereKey, number>> = {};
  let sum = 0;
  for (const c of CRITERES) {
    const w = c.base * multFor(template, c.key);
    raw[c.key] = w;
    sum += w;
  }
  const out = {} as Record<AuditVisuelCritereKey, number>;
  for (const c of CRITERES) {
    out[c.key] = ((raw[c.key] ?? 0) / sum) * SUM_BASE;
  }
  return out;
}

function libelleNote(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Bon";
  if (score >= 60) return "Correct";
  if (score >= 40) return "Fragile";
  return "Critique";
}

const TRANSVERSE_COMPLETION = [
  "Renforcer le parcours utilisateur jusqu’à la prise de contact (réduction des frictions).",
  "Aligner message d’accroche, preuves et offre pour clarifier la valeur perçue.",
  "Prévoir une passe qualité mobile et un test utilisateur rapide après refonte.",
  "Documenter les mots-clés et intentions locales pour nourrir le contenu et le référencement.",
];

const SUGGESTIONS_SECTEUR: Record<AuditVisuelTemplate, string[]> = {
  generique: [
    "Comparer visuellement avec 2–3 concurrents directs pour calibrer attentes du marché.",
    "Cartographier les 3 actions principales attendues des visiteurs (devis, appel, prise de RDV).",
  ],
  btp: [
    "Valoriser chantiers, certifications et garanties décennale / assurances en zones visibles.",
    "Structurer une entrée « Zones d’intervention » et maillage vers pages locales si pertinent.",
  ],
  artisan: [
    "Mettre en avant délais d’intervention, zone, et photos avant/après ou réalisations types.",
    "Ajouter un bouton d’appel cliquable et un formulaire court en tête de page d’accueil.",
  ],
  service_local: [
    "Renforcer avis Google, labels proximité et temps de réponse annoncé.",
    "Optimiser fiche Google Business Profile en cohérence avec les titres H1 du site.",
  ],
};

function sujetPhrase(entreprise: string | undefined): string {
  const e = entreprise?.trim();
  if (e) return `Le site de ${e}`;
  return "Votre site";
}

export function emptyAuditChecklist(): AuditVisuelChecklist {
  return {
    designDate: false,
    ctaAbsent: false,
    hierarchie: false,
    reassurance: false,
    responsive: false,
    structure: false,
    seoLocal: false,
    performancePerdue: false,
  };
}

export function generateAuditVisuelReport(
  checklist: AuditVisuelChecklist,
  template: AuditVisuelTemplate,
  options?: { entreprise?: string }
): AuditVisuelGenerated {
  const poids = poidsEffectifs(template);
  let penalite = 0;
  const issues: { key: AuditVisuelCritereKey; label: string; court: string; impact: number }[] = [];
  for (const c of CRITERES) {
    if (checklist[c.key]) {
      const impact = poids[c.key];
      penalite += impact;
      issues.push({ key: c.key, label: c.label, court: c.court, impact });
    }
  }
  penalite = Math.min(100, penalite);
  const noteSur100 = Math.max(0, Math.round(100 - penalite));
  const labelNote = libelleNote(noteSur100);
  const tri = [...issues].sort((a, b) => b.impact - a.impact);
  const topIssues = tri.slice(0, 4).map((x) => x.label);
  const sujet = sujetPhrase(options?.entreprise);

  const poolComplement = [...SUGGESTIONS_SECTEUR[template], ...TRANSVERSE_COMPLETION];
  let p = 0;
  while (topIssues.length < 4 && p < poolComplement.length * 2) {
    const next = poolComplement[p % poolComplement.length];
    p += 1;
    const prefixed = next.startsWith("À anticiper") ? next : `À anticiper : ${next}`;
    if (!topIssues.includes(prefixed)) topIssues.push(prefixed);
  }

  const hasIssue = tri.length > 0;
  const top2 = tri.slice(0, 2).map((x) => x.court);

  let syntheseCourte: string;
  if (!hasIssue) {
    syntheseCourte = `${sujet} obtient une note de ${noteSur100}/100 (${labelNote}) sur cette grille : aucun des huit critères n’est coché comme point faible. C’est une base favorable pour un discours commercial centré sur la croissance et la conversion.`;
  } else {
    syntheseCourte = `${sujet} est estimé à ${noteSur100}/100 (${labelNote}). Les principaux freins identifiés : ${top2.join(
      ", "
    )}. Une refonte ciblée peut sécuriser la crédibilité et les demandes entrantes.`;
  }

  const tplHint =
    template === "btp"
      ? "Dans le secteur BTP, la confiance et la preuve de savoir-faire priment."
      : template === "artisan"
        ? "Pour un artisan, la clarté de l’offre et la facilité pour joint doivent être immédiates."
        : template === "service_local"
          ? "Pour un service local, la visibilité « près de moi » et la réassurance décident souvent avant le prix."
          : "Une approche générique reste pertinente pour prioriser équilibrée.";

  const templateLabel = AUDIT_TEMPLATE_LABELS.find((t) => t.value === template)?.label ?? "Générique";
  const synthesePremium = `${sujet} se situe à ${noteSur100}/100 (${labelNote}) selon une grille d’audit visuelle et d’expérience utilisateur pondérée pour le profil « ${templateLabel} ». ${tplHint} ${
    hasIssue
      ? `Les impacts les plus lourds concernent : ${tri
          .slice(0, 3)
          .map((x) => x.court)
          .join(
            " ; "
          )}. Nous recommandons une feuille de route courte : corrections à fort effet (CTA, hiérarchie, mobile), puis contenus et référencement local.`
      : `Sur la base des cases cochées, la grille ne signale pas de point noir majeur : l’argumentaire peut insister sur l’optimisation continue, les A/B tests de conversion et l’alignement avec vos objectifs business.`
  }`;

  const argumentsCommerciaux: string[] = [];
  if (noteSur100 < 75) {
    argumentsCommerciaux.push(
      `Note ${noteSur100}/100 : chaque point non traité peut coûter des demandes — un plan d’action chiffré rassure.`
    );
  } else {
    argumentsCommerciaux.push(
      `Bon score (${noteSur100}/100) : l’enjeu est de passer du « correct » à « irrésistible » pour gagner des parts sur les recherches locales.`
    );
  }
  argumentsCommerciaux.push(
    "Une grille d’audit partagée crée un langage commun avec le décideur (preuve, pas opinion)."
  );
  if (tri.some((x) => x.key === "seoLocal")) {
    argumentsCommerciaux.push(
      "Le SEO local est un actif composé : pages, maillage et signaux hors site — expliquer le ROI sur 6–12 mois."
    );
  }
  if (tri.some((x) => x.key === "reassurance")) {
    argumentsCommerciaux.push(
      "Sans réassurance visible, le trafic ne se transforme pas : c’est souvent le levier le plus rapide après mise en page."
    );
  }
  argumentsCommerciaux.push(
    "Proposer un pilote (quick wins) + phase 2 (refonte ou templates) cadre l’investissement."
  );

  const prioritesRefonte: string[] = tri.slice(0, 6).map((x, i) => {
    const action: Record<AuditVisuelCritereKey, string> = {
      designDate: "Rafraîchir l’identité visuelle et les composants UI (boutons, cards, typographie).",
      ctaAbsent: "Poser des CTA clairs (hero, fin de section, sticky mobile) avec formulation unique.",
      hierarchie: "Réorganiser titres, blancs et contrastes pour guider l’œil vers l’action.",
      reassurance: "Ajouter avis, logos partenaires, chiffres clés et réponses aux objections.",
      responsive: "Corriger grilles, tailles de texte et zones tactiles sur mobile.",
      structure: "Simplifier l’arborescence et regrouper les contenus par intention utilisateur.",
      seoLocal: "Renforcer titres, contenus de proximité et données structurées locales.",
      performancePerdue: "Réduire éléments lourds, optimiser le ressenti (LCP, animations, chargement).",
    };
    return `${i + 1}. ${action[x.key]}`;
  });
  if (prioritesRefonte.length === 0) {
    prioritesRefonte.push(
      "1. Figer une cible de conversion et mesurer la baseline (formulaires, appels).",
      "2. Planifier une revue UX/UI légère pour grignoter les derniers points sur la grille.",
      "3. Enrichir le suivi analytics et les objectifs dans votre outil de pilotage."
    );
  }

  return {
    noteSur100,
    labelNote,
    faiblessesPrincipales: topIssues.slice(0, 4),
    syntheseCourte,
    synthesePremium,
    argumentsCommerciaux: argumentsCommerciaux.slice(0, 6),
    prioritesRefonte,
  };
}

export function buildAuditVisuelDossier(
  checklist: AuditVisuelChecklist,
  template: AuditVisuelTemplate,
  options?: { entreprise?: string }
) {
  const now = new Date().toISOString();
  return {
    template,
    checklist: { ...checklist },
    generated: generateAuditVisuelReport(checklist, template, options),
    updatedAt: now,
  };
}
