"use client";

import { FileText, Mail, Phone } from "lucide-react";
import {
  appCardKpi,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  kpiLabelDangerClass,
  staggerCardsGridClass,
} from "@/app/components/appCardStyles";

interface RelancesKpiCardsProps {
  auditsAEnvoyer: number;
  relancesMailAFaire: number;
  relancesAppelAFaire: number;
}

export default function RelancesKpiCards({
  auditsAEnvoyer,
  relancesMailAFaire,
  relancesAppelAFaire,
}: RelancesKpiCardsProps) {
  return (
    <div
      className={`grid ${staggerCardsGridClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6`}
    >
      <div className={appCardKpi}>
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className={kpiLabelClass}>Audits à envoyer</p>
          <p className={kpiValueClass}>{auditsAEnvoyer}</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">
            Prospects <strong className="font-medium text-zinc-700 dark:text-zinc-300">sans date d&apos;envoi d&apos;audit</strong>, hors dossiers validés ou refusés côté réponse.
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <FileText className={kpiIconClass} aria-hidden />
        </div>
      </div>
      <div className={appCardKpi}>
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className={kpiLabelDangerClass}>Relances mail à faire</p>
          <p className={kpiValueClass}>{relancesMailAFaire}</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">
            Entreprises où l&apos;audit a été envoyé il y a <strong className="font-medium text-zinc-700 dark:text-zinc-300">3 jours ou plus</strong>, sans relance mail enregistrée.
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <Mail className={kpiIconClass} aria-hidden />
        </div>
      </div>
      <div className={appCardKpi}>
        <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
          <p className={kpiLabelClass}>Relances appel à faire</p>
          <p className={kpiValueClass}>{relancesAppelAFaire}</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">
            Entreprises où le <strong className="font-medium text-zinc-700 dark:text-zinc-300">mail de relance</strong> a été envoyé il y a{" "}
            <strong className="font-medium text-zinc-700 dark:text-zinc-300">1 semaine ou plus</strong>, sans appel de relance enregistré.
          </p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-start">
          <Phone className={kpiIconClass} aria-hidden />
        </div>
      </div>
    </div>
  );
}
