/**
 * Design system — cartes, pages et formulaires (aligné sur le dashboard).
 */

export const appCardBase =
  "motion-card rounded-xl sm:rounded-2xl border border-neutral-200/90 dark:border-white/[0.06] " +
  "bg-white dark:bg-[#12131a] " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] " +
  "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] " +
  "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform " +
  "hover:-translate-y-1 hover:border-neutral-300/90 dark:hover:border-white/[0.09] " +
  "hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const appCardKpi = `${appCardBase} p-6 md:p-5 h-full flex justify-between overflow-hidden`;

export const appCardKpiColumn = `${appCardBase} p-6 md:p-5 h-full flex flex-col justify-between overflow-hidden`;

export const appCardChart = `${appCardBase} p-6 md:p-5 flex flex-col overflow-hidden relative h-full`;

/** Cartes du dashboard — coins plus arrondis que le reste du site. */
export const dashboardCardBase =
  "motion-card rounded-3xl border-0 " +
  "bg-white dark:bg-[#12131a] " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] " +
  "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] " +
  "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform " +
  "hover:-translate-y-1 " +
  "hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const kpiLabelClass =
  "text-zinc-500 dark:text-zinc-500 text-xs md:text-lg font-medium md:font-semibold uppercase md:normal-case tracking-widest md:tracking-normal " +
  "md:text-[#ED8600] dark:md:text-[#8fa9c9]";

export const kpiLabelSuccessClass =
  "text-zinc-500 dark:text-zinc-500 text-xs md:text-lg font-medium md:font-semibold uppercase md:normal-case tracking-widest md:tracking-normal " +
  "md:text-emerald-700 dark:md:text-emerald-400";

export const kpiLabelDangerClass =
  "text-zinc-500 dark:text-zinc-500 text-xs md:text-lg font-medium md:font-semibold uppercase md:normal-case tracking-widest md:tracking-normal " +
  "md:text-red-700 dark:md:text-rose-400";

export const kpiValueClass =
  "text-zinc-900 dark:text-zinc-50 text-3xl md:text-[clamp(28px,3vw,40px)] font-semibold tracking-tight tabular-nums";

export const kpiIconClass =
  "h-10 w-10 sm:h-11 sm:w-11 text-[#ED8600]/25 dark:text-[#8fa9c9]/20";

export const kpiIconSuccessClass =
  "h-10 w-10 sm:h-11 sm:w-11 text-emerald-600/30 dark:text-emerald-400/25";

export const kpiIconDangerClass =
  "h-10 w-10 sm:h-11 sm:w-11 text-red-600/30 dark:text-rose-400/25";

export const badgePositiveClass =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
  "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300";

export const badgeNegativeClass =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
  "bg-rose-500/12 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300";

export const chartAccentLight = "#ED8600";
export const chartAccentDark = "#6b8fc7";

/** Conteneur page (fond + padding) */
export const pageShellClass =
  "min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] dark:bg-[#0a0a0c] p-3 sm:p-4 md:p-8 md:px-10 lg:px-12";

export const pageEyebrowClass =
  "text-zinc-500 dark:text-zinc-500 text-[11px] uppercase tracking-[0.2em] font-medium mb-1.5 md:block";

export const pageTitleClass =
  "text-[#ED8600] dark:text-[#8fa9c9] font-semibold text-2xl sm:text-xl md:text-[28px] tracking-tight";

export const pageSubtitleClass =
  "text-zinc-600 dark:text-zinc-500 text-sm sm:text-base md:text-[15px] mt-1 leading-relaxed max-w-2xl";

export const pageDividerClass =
  "mt-7 md:mt-8 h-px bg-gradient-to-r from-transparent via-zinc-200/90 dark:via-white/[0.07] to-transparent hidden md:block";

export const primaryButtonClass =
  "px-4 sm:px-6 py-2.5 rounded-xl font-medium text-sm sm:text-base text-white w-full sm:w-auto " +
  "bg-[#ED8600] hover:bg-[#d97706] dark:bg-[#5b7fb8] dark:hover:bg-[#4e6fa3] " +
  "shadow-md shadow-[#ED8600]/20 dark:shadow-[#5b7fb8]/25 transition-colors duration-200";

export const secondaryButtonClass =
  "px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm border border-zinc-200 dark:border-white/[0.1] " +
  "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#12131a] hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors duration-200";

/** Panneaux (tableaux, listes, sections formulaire) */
export const panelSurfaceClass =
  "motion-card border border-neutral-200/90 dark:border-white/[0.06] rounded-xl md:rounded-2xl " +
  "bg-white dark:bg-[#12131a] " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] " +
  "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform " +
  "hover:-translate-y-px hover:border-neutral-300/80 dark:hover:border-white/[0.09] " +
  "hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_10px_36px_rgba(0,0,0,0.42)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/** Grille où les cartes KPI s’animent en cascade (optionnel). */
export const staggerCardsGridClass = "stagger-cards";

export const inputFieldClass =
  "w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-white/[0.1] " +
  "bg-white dark:bg-[#0a0a0c] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 " +
  "focus:outline-none focus:border-[#ED8600] dark:focus:border-[#8fa9c9] focus:ring-1 focus:ring-[#ED8600]/20 dark:focus:ring-[#8fa9c9]/20 transition-colors";

export const formLabelClass = "block text-zinc-600 dark:text-zinc-400 text-sm mb-2";

export const sectionHeadingClass =
  "text-zinc-700 dark:text-zinc-300 font-semibold text-base md:text-[15px] mb-4";

export const tabActiveClass =
  "bg-transparent text-[#ED8600] dark:text-[#8fa9c9] border-[#ED8600] dark:border-[#8fa9c9]";

export const tabInactiveClass =
  "text-zinc-500 dark:text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50/80 dark:hover:bg-white/[0.04]";

/** Onglets type « pilule » (plus lisible que bordure seule) */
export const segmentedBarClass =
  "inline-flex w-full max-w-md rounded-xl bg-zinc-200/80 p-1 dark:bg-white/[0.06] sm:w-auto";

export const segmentedTabActiveClass =
  "flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm dark:bg-[#12131a] dark:text-zinc-100 sm:flex-none";

export const segmentedTabInactiveClass =
  "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 sm:flex-none";

/** Titre de sous-section (page Finance, etc.) */
export const sectionIntroTitleClass =
  "text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200";

export const sectionIntroDescClass = "mt-0.5 text-xs text-zinc-500 dark:text-zinc-400";

/** Overlays / modales */
export const overlayBackdropClass =
  "fixed inset-0 z-[70] flex items-start md:items-center justify-center p-4 pt-20 md:pt-4 " +
  "bg-zinc-950/55 dark:bg-black/65 backdrop-blur-md";

export const overlayPanelClass =
  "w-full max-w-2xl max-h-[min(90vh,800px)] flex flex-col overflow-hidden rounded-2xl " +
  "border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#12131a] " +
  "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.75)] " +
  "mx-2 sm:mx-4";

export const overlayPanelNarrowClass =
  "w-full max-w-md max-h-[min(90vh,720px)] flex flex-col overflow-hidden rounded-2xl " +
  "border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#12131a] " +
  "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.75)] " +
  "mx-2 sm:mx-4";

export const overlayPanelWideClass =
  "w-full max-w-3xl max-h-[min(90vh,900px)] flex flex-col overflow-hidden rounded-2xl " +
  "border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#12131a] " +
  "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.75)] " +
  "mx-2 sm:mx-4";

/** Aperçu document (fond sombre, zone d’impression blanche à l’intérieur) */
export const overlayDocumentViewerClass =
  "w-full max-w-3xl max-h-[min(90vh,900px)] flex flex-col overflow-hidden rounded-2xl " +
  "border border-zinc-600/60 bg-zinc-900 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)] mx-2 sm:mx-4";

export const overlayHeaderClass =
  "flex shrink-0 items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 border-b border-zinc-100 dark:border-white/[0.06]";

export const overlayTitleClass =
  "text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 pr-2";

export const overlayCloseButtonClass =
  "rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200";

export const overlayScrollBodyClass =
  "flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-4";

export const overlayFooterClass =
  "flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 dark:border-white/[0.06] " +
  "bg-zinc-50/80 dark:bg-white/[0.02] px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6";

/** Alias compat. imports historiques `dashboardCard*` */
export const dashboardCardKpi = `${dashboardCardBase} p-6 md:p-5 h-full flex justify-between overflow-hidden`;
export const dashboardCardChart = `${dashboardCardBase} p-6 md:p-5 flex flex-col overflow-hidden relative h-full`;
