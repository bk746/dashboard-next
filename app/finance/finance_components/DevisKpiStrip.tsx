"use client";

import { FileCheck, Send, Ban } from "lucide-react";
import FinanceStatCard from "./FinanceStatCard";
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <FinanceStatCard
        label="Acceptés"
        value={formatEuro(montantAcceptes)}
        hint={`${acceptes.length} devis — portefeuille complet`}
        tone="positive"
        icon={<FileCheck aria-hidden />}
      />
      <FinanceStatCard
        label="En pipeline"
        value={formatEuro(montantPipeline)}
        hint={`${pipeline.length} devis (brouillon / envoyé)`}
        icon={<Send aria-hidden />}
      />
      <FinanceStatCard
        label="Refusés"
        value={nbRefuses}
        hint="Devis refusés"
        tone={nbRefuses > 0 ? "negative" : "neutral"}
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
