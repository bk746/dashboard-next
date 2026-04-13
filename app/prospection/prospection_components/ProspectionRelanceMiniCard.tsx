"use client";

import type { ReactNode } from "react";
import { FileText, Mail, Phone, Users, type LucideIcon } from "lucide-react";
import { appCardKpi, kpiLabelClass, kpiValueClass, kpiIconClass, kpiLabelDangerClass } from "@/app/components/appCardStyles";

export type ProspectionRelanceMiniKind = "encours" | "audit" | "mail" | "appel";

const copy: Record<
  ProspectionRelanceMiniKind,
  { title: string; titleClass: string; body: ReactNode; Icon: LucideIcon }
> = {
  encours: {
    title: "Prospects en cours",
    titleClass: kpiLabelClass,
    body: (
      <>
        Dossiers avec réponse <strong className="font-medium text-zinc-700 dark:text-zinc-300">en attente</strong> — ils
        disparaissent du compteur dès que vous passez la fiche en <strong className="font-medium text-zinc-700 dark:text-zinc-300">Validé</strong> ou{" "}
        <strong className="font-medium text-zinc-700 dark:text-zinc-300">Refusé</strong>.
      </>
    ),
    Icon: Users,
  },
  audit: {
    title: "Audit et mail à envoyer",
    titleClass: kpiLabelClass,
    body: (
      <>
        Prospects <strong className="font-medium text-zinc-700 dark:text-zinc-300">sans date d&apos;envoi d&apos;audit</strong> — à traiter : envoi
        de l&apos;audit et du mail, hors dossiers validés ou refusés côté réponse.
      </>
    ),
    Icon: FileText,
  },
  mail: {
    title: "Relances mail à faire",
    titleClass: kpiLabelDangerClass,
    body: (
      <>
        Entreprises où l&apos;audit a été envoyé il y a <strong className="font-medium text-zinc-700 dark:text-zinc-300">3 jours ou plus</strong>,
        sans relance mail enregistrée.
      </>
    ),
    Icon: Mail,
  },
  appel: {
    title: "Relances appel à faire",
    titleClass: kpiLabelClass,
    body: (
      <>
        Entreprises où le <strong className="font-medium text-zinc-700 dark:text-zinc-300">mail de relance</strong> a été envoyé il y a{" "}
        <strong className="font-medium text-zinc-700 dark:text-zinc-300">1 semaine ou plus</strong>, sans appel de relance enregistré.
      </>
    ),
    Icon: Phone,
  },
};

interface ProspectionRelanceMiniCardProps {
  kind: ProspectionRelanceMiniKind;
  value: number;
}

export default function ProspectionRelanceMiniCard({ kind, value }: ProspectionRelanceMiniCardProps) {
  const c = copy[kind];
  const Icon = c.Icon;
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={c.titleClass}>{c.title}</p>
        <p className={kpiValueClass}>{value}</p>
        <p className="text-zinc-500 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2 leading-snug">{c.body}</p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <Icon className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
