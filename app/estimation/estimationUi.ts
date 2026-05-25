/** Styles partagés — pages Estimation (thème clair dashboard). */

export const estimationShellClass =
  "min-h-screen w-full bg-white text-zinc-900 p-3 sm:p-4 md:p-8 md:px-10 lg:px-12";

export const estimationPrimaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5DD3] to-[#5E549E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(108,93,211,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(108,93,211,0.55)] w-full sm:w-auto";

export const estimationSecondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-[#6C5DD3]/40 hover:bg-[#6C5DD3]/[0.04] hover:text-[#5E549E] w-full sm:w-auto";

export const estimationFloatingCard =
  "overflow-hidden rounded-3xl border-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_24px_-4px_rgba(0,0,0,0.10),0_16px_40px_-8px_rgba(0,0,0,0.06)]";

export const estimationInputClass =
  "w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/15";

export const estimationLightPanel =
  "w-full max-w-md max-h-[min(90vh,800px)] flex flex-col overflow-hidden rounded-3xl border-0 bg-white shadow-[0_24px_80px_-12px_rgba(108,93,211,0.22)] mx-2 sm:mx-4";

export const estimationLightPanelWide =
  "w-full max-w-2xl max-h-[min(92vh,900px)] flex flex-col overflow-hidden rounded-3xl border-0 bg-white shadow-[0_24px_80px_-12px_rgba(108,93,211,0.22)] mx-2 sm:mx-4";

export const estimationLightInput =
  "w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2 text-zinc-800 placeholder:text-zinc-400 focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/15 transition-colors";

export const estimationLightLabel = "block text-sm text-zinc-600 mb-2";

export const estimationVioletPrimaryBtn =
  "px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6C5DD3] to-[#5E549E] shadow-md shadow-[#6C5DD3]/25 hover:shadow-lg transition-all w-full sm:w-auto";

export const estimationAccent = "#6C5DD3";

/** Carte option relevée (ombre) vs enfoncée (sélectionnée, plate). */
export function estimationOptionCardClass(pressed: boolean): string {
  const base = "w-full text-left rounded-2xl transition-all duration-200 ease-out";
  if (pressed) {
    return `${base} border border-zinc-200/90 bg-zinc-100/95 p-4 shadow-none translate-y-0.5`;
  }
  return `${base} border-0 bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_6px_20px_-4px_rgba(108,93,211,0.14)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(108,93,211,0.18)]`;
}
