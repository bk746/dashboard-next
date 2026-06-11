"use client";

import Link from "next/link";
import { Target, Check } from "lucide-react";
import { primaryButtonClass } from "@/app/components/appCardStyles";

interface ObjectifAnnuelCardProps {
  /** Montant encaissé sur la période de l’objectif (année, mois ou semaine). */
  montantActuel: number;
  objectif: number;
  progression: number;
  /** Libellé de l’objectif financier suivi */
  objectifLibelle?: string;
  /** Sous-titre sous le montant (période de comparaison). */
  encaisseDescription?: string;
}

const cardShadow = "shadow-[0_1px_2px_rgba(0,0,0,0.03)]";
const cardShadowHover = "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)]";

export default function ObjectifAnnuelCard({
  montantActuel,
  objectif,
  progression,
  objectifLibelle,
  encaisseDescription = "CA encaissé sur l'année civile en cours",
}: ObjectifAnnuelCardProps) {
  const hasObjectif = objectif > 0;
  const isCompleted = progression >= 100;
  const percentage = Math.min(Math.max(progression, 0), 100);

  const cardClass = `group relative h-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] p-6 ${cardShadow} transition-all duration-300 hover:-translate-y-1 ${cardShadowHover} md:p-7`;

  if (!hasObjectif) {
    return (
      <div className={cardClass}>
        <div className="flex h-full flex-col justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700">
              <Target className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/90">
                Objectif financier
              </p>
              <p className="text-[11px] text-zinc-500">Aucun objectif défini</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600">
            Créez un objectif de type « Financier » pour suivre votre progression (année, mois ou semaine).
          </p>
          <Link href="/objectifs" className={`${primaryButtonClass} w-full text-center sm:w-auto`}>
            Définir un objectif
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="relative flex h-full flex-col justify-between gap-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 transition-transform group-hover:scale-105">
            <Target className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/90">
              Objectif financier
            </p>
            {objectifLibelle ? (
              <p className="truncate text-[11px] text-zinc-500" title={objectifLibelle}>
                {objectifLibelle}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500">{encaisseDescription}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700">
            {Math.round(percentage)}%
          </span>
        </div>

        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 md:text-[36px] md:leading-[1.05]">
            {montantActuel.toLocaleString("fr-FR")} €
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 md:text-sm">
            <span>
              sur <span className="font-medium text-zinc-700">{objectif.toLocaleString("fr-FR")} €</span>
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Check className="h-3 w-3" aria-hidden />
                100% atteint
              </span>
            ) : null}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-zinc-500">
            <span>Progression</span>
            <span className="tabular-nums text-emerald-700">{Math.round(percentage)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-500/12">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-emerald-400"
              }`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progression de l'objectif financier"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
