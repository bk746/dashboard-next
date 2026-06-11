import { Target } from "lucide-react";
import type { ObjectifPeriode } from "@/app/types";
import { periodeLabelFr } from "@/app/lib/objectifsPeriod";
import {
  objectifsGoalCard,
  objectifsProgressTrack,
  objectifsProgressFill,
  objectifsProgressFillDone,
} from "@/app/objectifs/objectifsUi";

interface ObjectifCardProps {
  type: "Financier" | "Client";
  objectif: number;
  actuel: number;
  libelle: string;
  periode?: ObjectifPeriode;
}

export default function ObjectifCard({ type, objectif, actuel, libelle, periode = "annee" }: ObjectifCardProps) {
  const progression = objectif > 0 ? Math.min((actuel / objectif) * 100, 100) : 0;
  const isCompleted = progression >= 100;

  return (
    <div className={objectifsGoalCard}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#007AFF]">
            Objectif {type}
            <span className="font-normal normal-case text-zinc-500"> · {periodeLabelFr(periode)}</span>
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {objectif.toLocaleString("fr-FR")}
            {type === "Financier" ? " €" : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Actuel : {actuel.toLocaleString("fr-FR")}
            {type === "Financier" ? " €" : ""} / {objectif.toLocaleString("fr-FR")}
            {type === "Financier" ? " €" : ""}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/12 text-[#007AFF]">
          <Target className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
      </div>

      <div className="w-full">
        <div className={`${objectifsProgressTrack} h-2.5 mt-2`}>
          <div
            className={isCompleted ? objectifsProgressFillDone : objectifsProgressFill}
            style={{ width: `${progression}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-zinc-500">{libelle}</p>
          <p
            className="shrink-0 text-xs font-medium text-emerald-600"
          >
            {isCompleted ? "100 % — atteint" : `${progression.toFixed(1)} %`}
          </p>
        </div>
      </div>
    </div>
  );
}
