"use client";

import { useState, useMemo } from "react";
import { Target } from "lucide-react";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  primaryButtonClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
  panelSurfaceClass,
  staggerCardsGridClass,
} from "@/app/components/appCardStyles";
import ProgressionTotalCard from "./objectifs_components/ProgressionTotalCard";
import ObjectifCard from "./objectifs_components/ObjectifCard";
import ObjectifsTable from "./objectifs_components/ObjectifsTable";
import ObjectifForm from "./objectifs_components/ObjectifForm";
import type { Client, Facture, Objectif } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { getActuelPourObjectif, normalizeObjectifPeriode } from "@/app/lib/objectifsPeriod";

export default function Objectifs() {
  const [objectifs, setObjectifs] = useJsonBucket<Objectif[]>("objectifs", []);
  const [showForm, setShowForm] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<Objectif | null>(null);
  const [factures] = useJsonBucket<Facture[]>("factures", []);
  const [clients] = useJsonBucket<Client[]>("clients", []);

  const handleSaveObjectif = (objectif: Objectif) => {
    const updatedObjectifs = editingObjectif
      ? objectifs.map((o) => (o.id === objectif.id ? objectif : o))
      : [...objectifs, objectif];
    setObjectifs(updatedObjectifs);
    setEditingObjectif(null);
    setShowForm(false);
  };

  const handleDeleteObjectif = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      setObjectifs(objectifs.filter((o) => o.id !== id));
    }
  };

  const handleEditObjectif = (objectif: Objectif) => {
    setEditingObjectif(objectif);
    setShowForm(true);
  };

  const handleNewObjectif = () => {
    setEditingObjectif(null);
    setShowForm(true);
  };

  const now = useMemo(() => new Date(), []);

  const progressions = objectifs.map((obj) => {
    const actuel = getActuelPourObjectif(obj, factures, clients, now);
    return obj.objectif > 0 ? Math.min((actuel / obj.objectif) * 100, 100) : 0;
  });
  const progressionTotal =
    progressions.length > 0 ? progressions.reduce((sum, p) => sum + p, 0) / progressions.length : 0;

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-7 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={pageEyebrowClass}>Suivi</p>
              <h1 className={pageTitleClass}>Objectifs</h1>
              <p className={pageSubtitleClass}>CA et volume clients : cibles, progression et détail.</p>
            </div>
            <button type="button" onClick={handleNewObjectif} className={primaryButtonClass}>
              Nouvel objectif
            </button>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>

        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Progression globale">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Progression globale</h2>
            <p className={sectionIntroDescClass}>
              Moyenne de l&apos;avancement sur tous vos objectifs (CA et clients), par rapport aux cibles définies.
            </p>
          </div>
          <ProgressionTotalCard progressionTotal={progressionTotal} />
        </section>

        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Objectifs">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Vos objectifs</h2>
            <p className={sectionIntroDescClass}>
              Une carte par objectif : la progression compare la cible au réalisé sur la période choisie (année, mois ou semaine).
            </p>
          </div>
          <div
            className={`grid ${staggerCardsGridClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6`}
          >
            {objectifs.map((objectif) => {
              const actuel = getActuelPourObjectif(objectif, factures, clients, now);
              return (
                <ObjectifCard
                  key={objectif.id}
                  type={objectif.type}
                  objectif={objectif.objectif}
                  actuel={actuel}
                  libelle={objectif.libelle}
                  periode={normalizeObjectifPeriode(objectif.periode)}
                />
              );
            })}
            {objectifs.length === 0 && (
              <div className={`col-span-full ${panelSurfaceClass} flex flex-col items-center justify-center px-6 py-14 text-center`}>
                <div className="mb-4 rounded-2xl bg-zinc-100 p-5 dark:bg-white/[0.06]">
                  <Target className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Aucun objectif pour l&apos;instant</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                  Définissez une cible CA ou nombre de clients avec{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Nouvel objectif</span> — elle apparaîtra ici et dans le tableau détaillé.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-0" aria-label="Liste des objectifs">
          <ObjectifsTable objectifs={objectifs} onDelete={handleDeleteObjectif} onEdit={handleEditObjectif} />
        </section>
      </div>

      {showForm && (
        <ObjectifForm objectif={editingObjectif} onClose={() => setShowForm(false)} onSave={handleSaveObjectif} />
      )}
    </div>
  );
}
