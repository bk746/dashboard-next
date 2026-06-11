/** Styles partagés — pages Estimation (thème clair minimaliste, inspiration Apple). */

export const estimationShellClass =
  "min-h-screen w-full bg-[#F5F5F7] text-zinc-900 p-3 sm:p-4 md:p-8 md:px-10 lg:px-12";

export const estimationPrimaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#6C5DD3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5B4CC7] active:bg-[#5246B3] w-full sm:w-auto";

export const estimationSecondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 ring-1 ring-zinc-200/80 transition-colors hover:bg-zinc-50 w-full sm:w-auto";

export const estimationFloatingCard =
  "overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

export const estimationInputClass =
  "w-full rounded-xl border-0 bg-zinc-100/80 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/35";

export const estimationLightPanel =
  "w-full max-w-md max-h-[min(90vh,800px)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05] mx-2 sm:mx-4";

export const estimationLightPanelWide =
  "w-full max-w-2xl max-h-[min(92vh,900px)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05] mx-2 sm:mx-4";

export const estimationLightInput =
  "w-full rounded-xl border-0 bg-zinc-100/80 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/35";

export const estimationLightLabel = "block text-[13px] font-medium text-zinc-500 mb-1.5";

export const estimationVioletPrimaryBtn =
  "px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-[#6C5DD3] transition-colors hover:bg-[#5B4CC7] w-full sm:w-auto";

export const estimationAccent = "#6C5DD3";

/** Carte option relevée (ombre) vs enfoncée (sélectionnée, plate). */
export function estimationOptionCardClass(pressed: boolean): string {
  const base = "w-full text-left rounded-2xl transition-all duration-200 ease-out";
  if (pressed) {
    return `${base} bg-[#6C5DD3]/[0.07] p-4 ring-1 ring-[#6C5DD3]/30 shadow-none`;
  }
  return `${base} bg-white p-4 ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)]`;
}
