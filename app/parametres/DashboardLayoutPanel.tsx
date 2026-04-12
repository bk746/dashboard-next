"use client";

import { useMemo } from "react";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  ALL_DASHBOARD_WIDGET_IDS,
  DASHBOARD_WIDGET_LABELS,
  defaultDashboardLayoutPrefs,
  normalizeDashboardLayoutPrefs,
  type DashboardLayoutPrefs,
  type DashboardWidgetId,
} from "@/app/lib/dashboardLayout";
import { panelSurfaceClass, sectionHeadingClass, formLabelClass, primaryButtonClass } from "@/app/components/appCardStyles";

function moveId(list: DashboardWidgetId[], id: DashboardWidgetId, delta: -1 | 1): DashboardWidgetId[] {
  const i = list.indexOf(id);
  if (i < 0) return list;
  const j = i + delta;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function DashboardLayoutPanel() {
  const [raw, setRaw] = useJsonBucket<DashboardLayoutPrefs>("dashboardLayout", defaultDashboardLayoutPrefs());
  const prefs = useMemo(() => normalizeDashboardLayoutPrefs(raw), [raw]);

  const setHidden = (id: DashboardWidgetId, hidden: boolean) => {
    const set = new Set(prefs.hidden);
    if (hidden) set.add(id);
    else set.delete(id);
    setRaw({ ...prefs, hidden: ALL_DASHBOARD_WIDGET_IDS.filter((w) => set.has(w)) });
  };

  const move = (id: DashboardWidgetId, delta: -1 | 1) => {
    setRaw({ ...prefs, order: moveId(prefs.order, id, delta) });
  };

  const reset = () => setRaw(defaultDashboardLayoutPrefs());

  return (
    <div className={`${panelSurfaceClass} p-6 md:p-8`}>
      <h3 className={sectionHeadingClass}>Première page (dashboard)</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cochez les cartes du site (Clients, Finance, Deals, Prospection, Objectifs, etc.) que vous voulez sur la page
        d&apos;accueil, puis ordonnez-les. Les cartes « grille » se regroupent sur une même rangée lorsqu&apos;elles sont
        consécutives dans la liste ; les blocs larges (RDV prospection, bandeau devis) restent en pleine largeur.
      </p>

      <ul className="mt-6 space-y-3">
        {prefs.order.map((id) => {
          const hidden = prefs.hidden.includes(id);
          return (
            <li
              key={id}
              className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                hidden ? "border-zinc-200/80 bg-zinc-50/50 opacity-70 dark:border-white/[0.08] dark:bg-white/[0.02]" : "border-zinc-200/90 dark:border-white/[0.08]"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3 sm:min-w-0 sm:flex-1">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#ED8600] focus:ring-[#ED8600] dark:border-zinc-600 dark:bg-zinc-900 dark:focus:ring-[#5b7fb8]"
                  checked={!hidden}
                  onChange={(e) => setHidden(id, !e.target.checked)}
                />
                <span className={`text-sm font-medium ${hidden ? "text-zinc-500 line-through" : "text-zinc-800 dark:text-zinc-100"}`}>
                  {DASHBOARD_WIDGET_LABELS[id]}
                </span>
              </label>
              <div className="flex shrink-0 items-center gap-2 pl-7 sm:pl-0">
                <span className={`${formLabelClass} mb-0 text-[10px] uppercase sm:hidden`}>Position</span>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-white/[0.12] dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                  disabled={prefs.order.indexOf(id) === 0}
                  onClick={() => move(id, -1)}
                  aria-label="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-white/[0.12] dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                  disabled={prefs.order.indexOf(id) === prefs.order.length - 1}
                  onClick={() => move(id, 1)}
                  aria-label="Descendre"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={reset} className={primaryButtonClass}>
          Réinitialiser l&apos;ordre et l&apos;affichage
        </button>
      </div>
    </div>
  );
}
