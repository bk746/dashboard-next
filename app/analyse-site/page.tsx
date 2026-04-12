"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Globe,
  Lightbulb,
  Loader2,
  Search,
  Shield,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  primaryButtonClass,
  inputFieldClass,
} from "@/app/components/appCardStyles";

/* ------------------------------------------------------------------ */
/*  Types (mirrored from API)                                          */
/* ------------------------------------------------------------------ */

interface AnalyseProblem {
  id: string;
  category: string;
  severity: "critique" | "important" | "mineur";
  title: string;
  description: string;
  recommendation: string;
  impact: number;
}

interface AnalyseResult {
  url: string;
  score: number;
  scoreLabel: string;
  problems: AnalyseProblem[];
  pitchCourt: string;
  pitchDetaille: string;
  pointsForts: string[];
  resumeExecutif: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon; color: string; darkColor: string }> = {
  design: { label: "Design", icon: Sparkles, color: "text-violet-700 bg-violet-100", darkColor: "dark:text-violet-300 dark:bg-violet-500/20" },
  conversion: { label: "Conversion", icon: TrendingUp, color: "text-amber-800 bg-amber-100", darkColor: "dark:text-amber-300 dark:bg-amber-500/20" },
  mobile: { label: "Mobile", icon: Zap, color: "text-blue-700 bg-blue-100", darkColor: "dark:text-blue-300 dark:bg-blue-500/20" },
  seo: { label: "SEO", icon: Search, color: "text-emerald-700 bg-emerald-100", darkColor: "dark:text-emerald-300 dark:bg-emerald-500/20" },
  performance: { label: "Performance", icon: Zap, color: "text-orange-700 bg-orange-100", darkColor: "dark:text-orange-300 dark:bg-orange-500/20" },
  contenu: { label: "Contenu", icon: Lightbulb, color: "text-cyan-700 bg-cyan-100", darkColor: "dark:text-cyan-300 dark:bg-cyan-500/20" },
  confiance: { label: "Confiance", icon: Shield, color: "text-rose-700 bg-rose-100", darkColor: "dark:text-rose-300 dark:bg-rose-500/20" },
  technique: { label: "Technique", icon: Globe, color: "text-zinc-700 bg-zinc-200", darkColor: "dark:text-zinc-300 dark:bg-white/10" },
};

const SEV_COLORS: Record<string, string> = {
  critique: "bg-red-500 text-white dark:bg-red-600",
  important: "bg-amber-500 text-white dark:bg-amber-600",
  mineur: "bg-zinc-400 text-white dark:bg-zinc-600",
};

function scoreAccent(s: number) {
  if (s >= 80) return { ring: "text-emerald-500", bar: "bg-emerald-500", glow: "shadow-emerald-500/20" };
  if (s >= 60) return { ring: "text-amber-500", bar: "bg-amber-500", glow: "shadow-amber-500/20" };
  if (s >= 40) return { ring: "text-orange-500", bar: "bg-orange-500", glow: "shadow-orange-500/20" };
  return { ring: "text-red-500", bar: "bg-red-500", glow: "shadow-red-500/20" };
}

const LOADING_STEPS = [
  "Connexion au site…",
  "Chargement de la page d'accueil…",
  "Exploration des pages internes…",
  "Analyse de la structure HTML…",
  "Détection des CTA et formulaires…",
  "Vérification mobile & technique…",
  "Envoi à l'IA pour diagnostic…",
  "Génération du rapport et du pitch…",
];

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); } catch { /* */ }
}

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, label }: { score: number; label: string }) {
  const acc = scoreAccent(score);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-200 dark:text-white/[0.08]" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className={`${acc.ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold tabular-nums ${acc.ring}`}>{score}</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">/100</span>
        </div>
      </div>
      <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${acc.ring} bg-current/10`}>
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Problem Card                                                       */
/* ------------------------------------------------------------------ */

function ProblemCard({ problem, index }: { problem: AnalyseProblem; index: number }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_META[problem.category] ?? CATEGORY_META.technique;
  const CatIcon = cat.icon;
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 ${
        problem.severity === "critique"
          ? "border-red-300/80 bg-red-50/40 dark:border-red-500/25 dark:bg-red-950/20"
          : problem.severity === "important"
            ? "border-amber-300/60 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-950/15"
            : "border-zinc-200/90 bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-start gap-4 p-4 text-left sm:p-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold tabular-nums text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${cat.color} ${cat.darkColor}`}>
              <CatIcon className="h-3 w-3" aria-hidden />
              {cat.label}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEV_COLORS[problem.severity]}`}>
              {problem.severity}
            </span>
            <span className="ml-auto text-xs font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
              Impact {problem.impact}/10
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{problem.title}</p>
        </div>

        <Chevron className="mt-1 h-5 w-5 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />
      </button>

      {open && (
        <div className="border-t border-zinc-200/70 px-5 pb-5 pt-4 dark:border-white/[0.06]">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{problem.description}</p>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50/80 px-4 py-3 dark:bg-emerald-950/25">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">{problem.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyseSitePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalyseResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPitchDetaille, setShowPitchDetaille] = useState(false);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyse = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResult(null);
    setLoadingStep(0);
    setCopied(false);
    setShowPitchDetaille(false);

    stepTimer.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2800);

    try {
      const res = await fetch("/api/analyse-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur inconnue");
      } else {
        setResult(data as AnalyseResult);
      }
    } catch {
      setError("Erreur réseau — vérifiez votre connexion.");
    } finally {
      if (stepTimer.current) clearInterval(stepTimer.current);
      setLoading(false);
    }
  }, [url]);

  const fullExport = result
    ? [
        `ANALYSE SITE — ${result.url}`,
        `Score : ${result.score}/100 (${result.scoreLabel})`,
        "",
        "═══ RÉSUMÉ EXÉCUTIF ═══",
        result.resumeExecutif,
        "",
        "═══ PROBLÈMES IDENTIFIÉS ═══",
        ...result.problems.map(
          (p, i) => `${i + 1}. [${p.severity.toUpperCase()}] ${p.title}\n   ${p.description}\n   → ${p.recommendation}`
        ),
        "",
        "═══ POINTS FORTS ═══",
        ...result.pointsForts.map((p, i) => `${i + 1}. ${p}`),
        "",
        "═══ PITCH COURT ═══",
        result.pitchCourt,
        "",
        "═══ PITCH DÉTAILLÉ ═══",
        result.pitchDetaille,
      ].join("\n")
    : "";

  const handleCopy = async () => {
    await copyText(fullExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const card =
    "rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/90 shadow-sm dark:border-white/[0.08] dark:from-[#12131a] dark:to-[#0f1016]";

  const critiques = result?.problems.filter((p) => p.severity === "critique") ?? [];
  const importants = result?.problems.filter((p) => p.severity === "important") ?? [];
  const mineurs = result?.problems.filter((p) => p.severity === "mineur") ?? [];

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <p className={pageEyebrowClass}>Analyse IA</p>
        <h1 className={pageTitleClass}>Analyseur de site</h1>
        <p className={pageSubtitleClass}>
          Entrez l&apos;URL d&apos;un site — l&apos;IA explore les pages, identifie les problèmes et génère un pitch prêt à envoyer au client.
        </p>

        {/* URL input */}
        <div className={`mt-8 ${card} p-5 sm:p-7`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && analyse()}
                placeholder="https://exemple.fr"
                className={`${inputFieldClass} pl-11`}
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={analyse}
              disabled={loading || !url.trim()}
              className={`${primaryButtonClass} inline-flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Search className="h-5 w-5" aria-hidden />
              )}
              {loading ? "Analyse en cours…" : "Analyser"}
            </button>
          </div>

          {/* Loading animation */}
          {loading && (
            <div className="mt-6 space-y-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ED8600] to-amber-400 dark:from-[#5b7fb8] dark:to-blue-400 transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#ED8600] dark:text-[#8fa9c9]" aria-hidden />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 animate-pulse">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50/80 px-4 py-3 dark:border-red-500/25 dark:bg-red-950/25">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score + URL + copy */}
            <div className={`${card} p-6 sm:p-8`}>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
                <ScoreRing score={result.score} label={result.scoreLabel} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <Globe className="h-4 w-4 text-zinc-400" aria-hidden />
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#ED8600] underline-offset-2 hover:underline dark:text-[#8fa9c9]"
                    >
                      {result.url.replace(/^https?:\/\//, "")}
                      <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden />
                    </a>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Résumé exécutif</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{result.resumeExecutif}</p>

                  {/* KPI strip */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-red-50/80 px-3 py-2.5 text-center dark:bg-red-950/25">
                      <span className="block text-xl font-bold tabular-nums text-red-600 dark:text-red-400">{critiques.length}</span>
                      <span className="text-[11px] font-medium text-red-800 dark:text-red-300">Critiques</span>
                    </div>
                    <div className="rounded-xl bg-amber-50/80 px-3 py-2.5 text-center dark:bg-amber-950/25">
                      <span className="block text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{importants.length}</span>
                      <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">Importants</span>
                    </div>
                    <div className="rounded-xl bg-zinc-100 px-3 py-2.5 text-center dark:bg-white/[0.06]">
                      <span className="block text-xl font-bold tabular-nums text-zinc-600 dark:text-zinc-300">{mineurs.length}</span>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Mineurs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-white/[0.08]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreAccent(result.score).bar}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="mt-1.5 text-center text-[11px] text-zinc-500 dark:text-zinc-500">
                90+ excellent · 75–89 bon · 60–74 correct · 40–59 fragile · &lt;40 critique
              </p>
            </div>

            {/* Points forts */}
            {result.pointsForts.length > 0 && (
              <div className={`${card} p-5 sm:p-7`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ThumbsUp className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Points forts</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Ce qui fonctionne déjà bien sur le site</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.pointsForts.map((pf, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 dark:border-emerald-500/15 dark:bg-emerald-950/15">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      <span className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">{pf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Problems */}
            <div className={`${card} p-5 sm:p-7`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Problèmes identifiés ({result.problems.length})
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Classés par sévérité puis impact — cliquez pour voir détails et recommandation
                  </p>
                </div>
              </div>

              {critiques.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critiques</p>
                  <div className="space-y-3">
                    {critiques.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} />)}
                  </div>
                </div>
              )}
              {importants.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Importants</p>
                  <div className="space-y-3">
                    {importants.map((p, i) => <ProblemCard key={p.id} problem={p} index={critiques.length + i} />)}
                  </div>
                </div>
              )}
              {mineurs.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mineurs</p>
                  <div className="space-y-3">
                    {mineurs.map((p, i) => <ProblemCard key={p.id} problem={p} index={critiques.length + importants.length + i} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Pitch */}
            <div className={`${card} p-5 sm:p-7`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ED8600]/10 text-[#ED8600] dark:bg-[#5b7fb8]/20 dark:text-[#a8c0e0]">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Pitch client</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Textes prêts à envoyer par e-mail ou à lire en rendez-vous</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ED8600] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#ED8600]/25 dark:bg-[#5b7fb8] dark:shadow-[#5b7fb8]/20"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden />
                  {copied ? "Copié !" : "Copier tout"}
                </button>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Pitch court
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{result.pitchCourt}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPitchDetaille(!showPitchDetaille)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-300"
                >
                  <span className="flex items-center gap-2">
                    <ArrowRight className={`h-4 w-4 transition-transform ${showPitchDetaille ? "rotate-90" : ""}`} aria-hidden />
                    Voir le pitch détaillé
                  </span>
                </button>

                {showPitchDetaille && (
                  <div className="rounded-xl border border-[#ED8600]/20 bg-[#ED8600]/5 p-5 dark:border-[#5b7fb8]/20 dark:bg-[#5b7fb8]/5">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#b45309] dark:text-[#a8c0e0]">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                      Pitch détaillé (premium)
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{result.pitchDetaille}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
