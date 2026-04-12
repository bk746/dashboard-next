"use client";

import { useCallback, useEffect, useMemo, useState, startTransition, type ComponentType } from "react";
import type { AuditVisuelChecklist, AuditVisuelDossier, AuditVisuelTemplate } from "@/app/types";
import { AUDIT_TEMPLATE_LABELS, buildAuditVisuelDossier, emptyAuditChecklist } from "@/app/audit-visuel/auditVisuelEngine";
import type { AuditVisuelCritereKey } from "@/app/audit-visuel/auditVisuelEngine";
import {
  Building2,
  ClipboardList,
  Hammer,
  LayoutGrid,
  Lightbulb,
  MapPinned,
  MousePointerClick,
  Palette,
  Rows3,
  ScanEye,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";

type CriterionDef = {
  key: AuditVisuelCritereKey;
  label: string;
  hint: string;
  icon: typeof Palette;
};

const GROUPS: { id: string; title: string; subtitle: string; items: CriterionDef[] }[] = [
  {
    id: "identite",
    title: "Identité & lecture",
    subtitle: "Première impression, hiérarchie des titres et parcours des contenus",
    items: [
      {
        key: "designDate",
        label: "Design daté",
        hint: "Esthétique vieillissante, typographies ou composants qui trahissent l’âge du site.",
        icon: Palette,
      },
      {
        key: "hierarchie",
        label: "Hiérarchie visuelle faible",
        hint: "Titres peu contrastés, blocs trop denses, œil qui ne sait pas où cliquer.",
        icon: Rows3,
      },
      {
        key: "structure",
        label: "Structure confuse",
        hint: "Navigation floue, pages redondantes ou informations éparpillées.",
        icon: LayoutGrid,
      },
    ],
  },
  {
    id: "conversion",
    title: "Conversion & confiance",
    subtitle: "Passage à l’action et éléments qui rassurent avant le contact",
    items: [
      {
        key: "ctaAbsent",
        label: "CTA absent ou peu visible",
        hint: "Peu ou pas de boutons « Devis », « Appeler », formulaire en retrait.",
        icon: MousePointerClick,
      },
      {
        key: "reassurance",
        label: "Faible réassurance",
        hint: "Peu d’avis, logos, garanties, chiffres ou preuves de réalisations.",
        icon: Shield,
      },
    ],
  },
  {
    id: "tech",
    title: "Technique & mobile",
    subtitle: "Ressenti de vitesse et expérience sur téléphone",
    items: [
      {
        key: "responsive",
        label: "Responsive faible",
        hint: "Texte trop petit, débordements, boutons difficiles à toucher sur mobile.",
        icon: Smartphone,
      },
      {
        key: "performancePerdue",
        label: "Performance perçue faible",
        hint: "Chargement lent, saccades, impression de lourdeur au scroll.",
        icon: Zap,
      },
    ],
  },
  {
    id: "visibilite",
    title: "Visibilité locale",
    subtitle: "Comment le site soutient la recherche « près de chez moi »",
    items: [
      {
        key: "seoLocal",
        label: "SEO local faible",
        hint: "Titres génériques, peu de mentions géo, contenus peu alignés Google / fiche Maps.",
        icon: MapPinned,
      },
    ],
  },
];

const TEMPLATE_UI: Record<
  AuditVisuelTemplate,
  { icon: typeof Building2; accent: string; darkAccent: string }
> = {
  generique: {
    icon: Building2,
    accent: "from-zinc-500/10 to-zinc-500/5 ring-zinc-300/80",
    darkAccent: "dark:from-white/[0.08] dark:to-white/[0.02] dark:ring-white/[0.12]",
  },
  btp: {
    icon: Hammer,
    accent: "from-amber-500/15 to-orange-500/5 ring-amber-400/40",
    darkAccent: "dark:from-amber-900/30 dark:to-orange-950/20 dark:ring-amber-500/25",
  },
  artisan: {
    icon: Wrench,
    accent: "from-sky-500/12 to-blue-500/5 ring-sky-400/35",
    darkAccent: "dark:from-sky-900/35 dark:to-blue-950/20 dark:ring-sky-500/25",
  },
  service_local: {
    icon: MapPinned,
    accent: "from-emerald-500/12 to-teal-500/5 ring-emerald-400/35",
    darkAccent: "dark:from-emerald-900/30 dark:to-teal-950/20 dark:ring-emerald-500/25",
  },
};

function noteAccent(score: number): { ring: string; text: string; bar: string } {
  if (score >= 75)
    return {
      ring: "text-emerald-500 dark:text-emerald-400",
      text: "text-emerald-800 dark:text-emerald-200",
      bar: "bg-emerald-500",
    };
  if (score >= 60)
    return {
      ring: "text-amber-500 dark:text-amber-400",
      text: "text-amber-900 dark:text-amber-200",
      bar: "bg-amber-500",
    };
  if (score >= 40)
    return {
      ring: "text-orange-500 dark:text-orange-400",
      text: "text-orange-900 dark:text-orange-200",
      bar: "bg-orange-500",
    };
  return {
    ring: "text-rose-500 dark:text-rose-400",
    text: "text-rose-900 dark:text-rose-200",
    bar: "bg-rose-500",
  };
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const acc = noteAccent(score);
  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-8">
      <div className="relative h-36 w-36 shrink-0">
        <svg className="-rotate-90 transform" viewBox="0 0 120 120" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            className="stroke-zinc-200/90 dark:stroke-white/[0.08]"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            className={`${acc.ring} transition-[stroke-dashoffset] duration-500 ease-out`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-bold tabular-nums tracking-tight ${acc.text}`}>{score}</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">/ 100</span>
        </div>
      </div>
      <div className="mt-4 text-center sm:mt-0 sm:text-left">
        <p className={`text-lg font-semibold ${acc.text}`}>{label}</p>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Plus la note est haute, moins la grille détecte de freins sur les critères cochés. La pondération dépend du type
          d&apos;entreprise choisi ci-dessus.
        </p>
      </div>
    </div>
  );
}

function StepRail() {
  const steps: { n: string; title: string; desc: string }[] = [
    { n: "1", title: "Contexte", desc: "Choisir le secteur" },
    { n: "2", title: "Observation", desc: "Signaler les freins" },
    { n: "3", title: "Synthèse", desc: "Note & textes" },
  ];
  return (
    <div className="mb-6">
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 sm:text-left">
        Parcours en 3 étapes
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-zinc-200/85 bg-gradient-to-br from-white to-zinc-50/90 px-3 py-3 shadow-sm dark:border-white/[0.08] dark:from-[#12131a] dark:to-[#0f1016] sm:px-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ED8600]/12 text-xs font-bold tabular-nums text-[#b45309] dark:bg-[#5b7fb8]/20 dark:text-[#a8c0e0]">
              {s.n}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{s.title}</p>
              <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ResultTab = "syntheses" | "commercial" | "actions";

interface AuditVisuelBlockProps {
  value: AuditVisuelDossier;
  onChange: (next: AuditVisuelDossier) => void;
  entrepriseHint?: string;
  compact?: boolean;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

function checklistsEqual(a: AuditVisuelChecklist, b: AuditVisuelChecklist): boolean {
  return (Object.keys(a) as AuditVisuelCritereKey[]).every((k) => a[k] === b[k]);
}

export default function AuditVisuelBlock({ value, onChange, entrepriseHint, compact }: AuditVisuelBlockProps) {
  const [resultTab, setResultTab] = useState<ResultTab>("syntheses");
  /** Cochage / modèle : appliqué tout de suite ; la remontée vers le parent est en transition (évite la latence sur la fiche prospect). */
  const [pending, setPending] = useState<{
    checklist: AuditVisuelChecklist;
    template: AuditVisuelTemplate;
  } | null>(null);

  const checklist = pending?.checklist ?? value.checklist;
  const template = pending?.template ?? value.template;

  const generated = useMemo(() => {
    if (!pending) return value.generated;
    return buildAuditVisuelDossier(checklist, template, { entreprise: entrepriseHint }).generated;
  }, [pending, value.generated, checklist, template, entrepriseHint]);

  useEffect(() => {
    if (!pending) return;
    const match =
      checklistsEqual(pending.checklist, value.checklist) && pending.template === value.template;
    if (match) setPending(null);
  }, [value.checklist, value.template, pending]);

  const emit = useCallback(
    (nextChecklist: AuditVisuelChecklist, nextTemplate: AuditVisuelTemplate) => {
      setPending({ checklist: nextChecklist, template: nextTemplate });
      startTransition(() => {
        onChange(buildAuditVisuelDossier(nextChecklist, nextTemplate, { entreprise: entrepriseHint }));
      });
    },
    [onChange, entrepriseHint]
  );

  const toggle = (key: AuditVisuelCritereKey) => {
    emit({ ...checklist, [key]: !checklist[key] }, template);
  };

  const setTemplate = (t: AuditVisuelTemplate) => {
    emit(checklist, t);
  };

  const reset = () => {
    const empty = emptyAuditChecklist();
    setPending({ checklist: empty, template });
    startTransition(() => {
      onChange(buildAuditVisuelDossier(empty, template, { entreprise: entrepriseHint }));
    });
  };

  const checkedCount = useMemo(() => GROUPS.flatMap((g) => g.items).filter((i) => checklist[i.key]).length, [checklist]);

  const exportTxt = [
    `Note : ${generated.noteSur100}/100 (${generated.labelNote})`,
    "",
    "Faiblesses principales :",
    ...generated.faiblessesPrincipales.map((l, i) => `${i + 1}. ${l}`),
    "",
    "Synthèse courte :",
    generated.syntheseCourte,
    "",
    "Synthèse approfondie :",
    generated.synthesePremium,
    "",
    "Arguments commerciaux :",
    ...generated.argumentsCommerciaux.map((l, i) => `• ${l}`),
    "",
    "Priorités de refonte :",
    ...generated.prioritesRefonte.map((l) => l),
  ].join("\n");

  const acc = noteAccent(generated.noteSur100);
  const tabBtn = (id: ResultTab, label: string, Icon: ComponentType<{ className?: string }>) => (
    <button
      type="button"
      role="tab"
      aria-selected={resultTab === id}
      onClick={() => setResultTab(id)}
      className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium sm:px-4 ${
        resultTab === id
          ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/90 dark:bg-gradient-to-r dark:from-amber-950/80 dark:to-zinc-900/90 dark:text-amber-50 dark:ring-amber-500/35"
          : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      {label}
    </button>
  );

  const cardShell =
    "rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/90 shadow-sm dark:border-white/[0.08] dark:from-[#12131a] dark:to-[#0f1016]";
  const innerPad = compact ? "p-4 sm:p-5" : "p-5 sm:p-7";

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {!compact ? (
        <StepRail />
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-3 py-2 text-center text-[11px] leading-relaxed text-zinc-600 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-zinc-400">
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Mode fiche prospect</strong> — même logique :
          secteur → freins observés → note & textes (faites défiler).
        </p>
      )}

      <section className={`${cardShell} ${innerPad}`}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ED8600]/20 to-[#ED8600]/5 text-[#b45309] dark:from-[#5b7fb8]/30 dark:to-[#5b7fb8]/5 dark:text-[#a8c0e0]">
              <Target className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                Étape 1 — Contexte
              </p>
              <h3 className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Pour quel type de site ?</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Le modèle ajuste automatiquement l&apos;importance de chaque critère (ex. SEO local pour un service de
                proximité, réassurance pour le BTP).
              </p>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
          {AUDIT_TEMPLATE_LABELS.map((t) => {
            const ui = TEMPLATE_UI[t.value];
            const Icon = ui.icon;
            const selected = template === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplate(t.value)}
                className={`cursor-pointer rounded-2xl border p-4 text-left ${
                  selected
                    ? `border-amber-300/80 bg-gradient-to-br ${ui.accent} ${ui.darkAccent} ring-2 ring-[#ED8600]/50 shadow-md dark:border-amber-500/40 dark:ring-[#8fa9c9]/50`
                    : "border-zinc-200/90 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-[#ED8600]/15 text-[#b45309] dark:bg-[#5b7fb8]/25 dark:text-[#c5d4ec]"
                        : "bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block font-semibold ${selected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-900 dark:text-zinc-100"}`}
                    >
                      {t.label}
                    </span>
                    <span
                      className={`mt-1 block text-xs leading-snug ${selected ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}
                    >
                      {t.hint}
                    </span>
                  </span>
                </div>
                {selected ? (
                  <p className="mt-3 text-[11px] font-medium text-[#c26500] dark:text-[#8fa9c9]">Modèle actif</p>
                ) : (
                  <p className="mt-3 text-[11px] text-zinc-400">Cliquer pour sélectionner</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className={`${cardShell} ${innerPad}`}>
        <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
              <ScanEye className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                Étape 2 — Observation
              </p>
              <h3 className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quels freins voyez-vous ?</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Ne cochez que ce que vous constatez réellement sur le site. Chaque point activé diminue la note selon son
                poids. Objectif : un diagnostic lisible pour le client, pas une liste exhaustive théorique.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium text-zinc-700 dark:border-white/[0.1] dark:bg-[#12131a] dark:text-zinc-300"
          >
            Réinitialiser la grille
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Freins signalés : <strong className="tabular-nums text-zinc-900 dark:text-zinc-100">{checkedCount}</strong> / 8
          </span>
          <span className="hidden h-4 w-px bg-zinc-300 sm:block dark:bg-white/[0.12]" aria-hidden />
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Astuce : moins vous cochez, plus la note reflète un site déjà solide sur ces critères.
          </span>
        </div>

        <div className="space-y-8">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <div className="mb-3 border-b border-zinc-200/70 pb-3 dark:border-white/[0.06]">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{group.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{group.subtitle}</p>
              </div>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.items.map((c) => {
                  const on = checklist[c.key];
                  const Icon = c.icon;
                  return (
                    <li key={c.key}>
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className={`flex w-full cursor-pointer rounded-2xl border p-4 text-left ${
                          on
                            ? "border-amber-400/90 bg-amber-50 shadow-sm ring-1 ring-amber-200/70 dark:border-amber-500/50 dark:bg-gradient-to-br dark:from-[#1c1611] dark:via-[#16130f] dark:to-[#0f0d0b] dark:shadow-[inset_0_1px_0_0_rgba(251,191,36,0.08)] dark:ring-amber-500/30"
                            : "border-zinc-200/90 bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            on
                              ? "bg-amber-500/25 text-amber-950 dark:bg-amber-500/15 dark:text-amber-200"
                              : "bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-medium ${on ? "text-zinc-900 dark:text-amber-50" : "text-zinc-900 dark:text-zinc-100"}`}
                            >
                              {c.label}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                on
                                  ? "bg-amber-200/90 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100"
                                  : "bg-zinc-200/80 text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-400"
                              }`}
                            >
                              {on ? "Frein actif" : "OK par défaut"}
                            </span>
                          </span>
                          <span
                            className={`mt-1 block text-xs leading-relaxed ${on ? "text-amber-950/85 dark:text-amber-200/90" : "text-zinc-600 dark:text-zinc-400"}`}
                          >
                            {c.hint}
                          </span>
                        </span>
                        <span
                          className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                            on
                              ? "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-500"
                              : "border-zinc-300 bg-white text-transparent dark:border-zinc-600 dark:bg-zinc-900"
                          }`}
                          aria-hidden
                        >
                          ✓
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardShell} ${innerPad}`}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-6 border-b border-zinc-200/70 pb-6 dark:border-white/[0.06]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Étape 3 — Synthèse automatique
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Résultat & textes prêts à l&apos;emploi</h3>
          </div>
          <button
            type="button"
            onClick={() => void copyText(exportTxt)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ED8600] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#ED8600]/25 dark:bg-[#5b7fb8] dark:shadow-[#5b7fb8]/20"
          >
            <ClipboardList className="h-4 w-4" aria-hidden />
            Copier tout l&apos;audit
          </button>
        </div>

        <ScoreRing score={generated.noteSur100} label={generated.labelNote} />

        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-white/[0.08]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${acc.bar}`}
            style={{ width: `${generated.noteSur100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-500 sm:text-left">
          Échelle indicative : 90+ excellent · 75–89 bon · 60–74 correct · 40–59 fragile · &lt;40 critique
        </p>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row">
          <div className="flex shrink-0 flex-col gap-1 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-2 dark:border-white/[0.08] dark:bg-white/[0.04] lg:w-56">
            {tabBtn("syntheses", "Synthèses", Sparkles)}
            {tabBtn("commercial", "Pitch & vente", TrendingUp)}
            {tabBtn("actions", "Plan d’action", Lightbulb)}
          </div>

          <div
            className="min-h-[200px] flex-1 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-inner dark:border-white/[0.08] dark:bg-[#0c0d12]/80 sm:p-6"
            role="tabpanel"
          >
            {resultTab === "syntheses" && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Vue courte
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{generated.syntheseCourte}</p>
                </div>
                <div className="h-px bg-zinc-200/80 dark:bg-white/[0.06]" />
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Vue détaillée (premium)
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{generated.synthesePremium}</p>
                </div>
              </div>
            )}

            {resultTab === "commercial" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Phrases à réutiliser en rendez-vous ou par e-mail — à adapter à votre ton.
                </p>
                <ul className="space-y-3">
                  {generated.argumentsCommerciaux.map((l, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 text-sm leading-snug text-zinc-800 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-zinc-200"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ED8600]/15 text-[11px] font-bold text-[#b45309] dark:bg-[#5b7fb8]/25 dark:text-[#a8c0e0]">
                        {i + 1}
                      </span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultTab === "actions" && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    4 axes à mettre en avant
                  </p>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
                    {generated.faiblessesPrincipales.map((l, i) => (
                      <li key={i} className="pl-1">
                        {l}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Priorités de refonte (ordre suggéré)
                  </p>
                  <ul className="space-y-2">
                    {generated.prioritesRefonte.map((l, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-xl border border-emerald-500/15 bg-emerald-50/50 px-3 py-2 text-sm text-zinc-800 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-zinc-200"
                      >
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">{l.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
