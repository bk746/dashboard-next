"use client";

import { FileCheck, Send, Ban } from "lucide-react";
import DashboardToneKpiCard from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import type { Devis } from "@/app/types";

interface DevisKpiStripProps {
  devis: Devis[];
  /** Sans titre de section (ex. intégration dashboard). */
  embedded?: boolean;
}

function formatEuro(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

export default function DevisKpiStrip({ devis, embedded }: DevisKpiStripProps) {
  const acceptes = devis.filter((d) => d.statut === "Accepté");
  const montantAcceptes = acceptes.reduce((s, d) => s + d.prix, 0);
  const pipeline = devis.filter((d) => d.statut === "Brouillon" || d.statut === "Envoyé");
  const montantPipeline = pipeline.reduce((s, d) => s + d.prix, 0);
  const nbRefuses = devis.filter((d) => d.statut === "Refusé").length;

  const grid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      <DashboardToneKpiCard
        tone="violet"
        label="Acceptés"
        subtitle={`${acceptes.length} devis — portefeuille complet`}
        value={formatEuro(montantAcceptes)}
        icon={<FileCheck aria-hidden />}
      />
      <DashboardToneKpiCard
        tone="pink"
        label="En pipeline"
        subtitle={`${pipeline.length} devis (brouillon / envoyé)`}
        value={formatEuro(montantPipeline)}
        icon={<Send aria-hidden />}
      />
      <DashboardToneKpiCard
        tone="pink"
        label="Refusés"
        subtitle="Devis refusés"
        value={nbRefuses}
        icon={<Ban aria-hidden />}
      />
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
    <section aria-label="Indicateurs devis">
      {grid}
    </section>
  );
}
