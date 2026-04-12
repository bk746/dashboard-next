import { FileCheck, Send, Ban } from "lucide-react";
import { appCardBase, sectionIntroDescClass, sectionIntroTitleClass } from "@/app/components/appCardStyles";
import type { Devis } from "@/app/types";

interface DevisKpiStripProps {
  devis: Devis[];
  /** Sans titre de section (ex. intégration dashboard). */
  embedded?: boolean;
}

export default function DevisKpiStrip({ devis, embedded }: DevisKpiStripProps) {
  const acceptes = devis.filter((d) => d.statut === "Accepté");
  const montantAcceptes = acceptes.reduce((s, d) => s + d.prix, 0);
  const pipeline = devis.filter((d) => d.statut === "Brouillon" || d.statut === "Envoyé");
  const montantPipeline = pipeline.reduce((s, d) => s + d.prix, 0);
  const nbRefuses = devis.filter((d) => d.statut === "Refusé").length;

  const grid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <div className={`${appCardBase} p-5 flex gap-4`}>
          <div className="rounded-xl bg-emerald-500/10 p-3 dark:bg-emerald-500/15">
            <FileCheck className="h-6 w-6 text-emerald-700 dark:text-emerald-400" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Acceptés</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {montantAcceptes.toLocaleString("fr-FR")} €
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{acceptes.length} devis</p>
          </div>
        </div>
        <div className={`${appCardBase} p-5 flex gap-4`}>
          <div className="rounded-xl bg-[#ED8600]/10 p-3 dark:bg-[#5b7fb8]/15">
            <Send className="h-6 w-6 text-[#c9760a] dark:text-[#8fa9c9]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">En pipeline</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {montantPipeline.toLocaleString("fr-FR")} €
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{pipeline.length} devis (brouillon / envoyé)</p>
          </div>
        </div>
        <div className={`${appCardBase} p-5 flex gap-4`}>
          <div className="rounded-xl bg-zinc-200/80 p-3 dark:bg-white/[0.06]">
            <Ban className="h-6 w-6 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Refusés</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{nbRefuses}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">devis refusés</p>
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return (
      <div className="w-full" aria-label="Indicateurs devis">
        {grid}
      </div>
    );
  }

  return (
    <section className="mb-6 px-4 sm:px-6 md:mb-8 md:px-0" aria-label="Indicateurs devis">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Vue d&apos;ensemble devis</h2>
        <p className={sectionIntroDescClass}>
          Montants signés, pipeline (brouillon + envoyé) et refus — sur l&apos;ensemble du portefeuille.
        </p>
      </div>
      {grid}
    </section>
  );
}
