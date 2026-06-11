"use client";

import { useState, useMemo } from "react";
import { Plus, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import DashboardToneKpiCard from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import ObjectifCard from "./objectifs_components/ObjectifCard";
import ObjectifsTable from "./objectifs_components/ObjectifsTable";
import ObjectifForm from "./objectifs_components/ObjectifForm";
import type { Client, Facture, Objectif } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { getActuelPourObjectif, normalizeObjectifPeriode } from "@/app/lib/objectifsPeriod";
import { objectifsShellClass, objectifsPrimaryBtn, objectifsFloatingCard } from "./objectifsUi";

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

  const { progressionTotal, objectifsAtteints } = useMemo(() => {
    const progressions = objectifs.map((obj) => {
      const actuel = getActuelPourObjectif(obj, factures, clients, now);
      return obj.objectif > 0 ? Math.min((actuel / obj.objectif) * 100, 100) : 0;
    });
    const total =
      progressions.length > 0 ? progressions.reduce((sum, p) => sum + p, 0) / progressions.length : 0;
    const atteints = progressions.filter((p) => p >= 100).length;
    return { progressionTotal: total, objectifsAtteints: atteints };
  }, [objectifs, factures, clients, now]);

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className={objectifsShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]">
              Objectifs
            </h1>
            <p className="mt-1 text-sm text-zinc-500 capitalize">{dateLabel}</p>
          </div>
          <button type="button" onClick={handleNewObjectif} className={objectifsPrimaryBtn}>
            <Plus className="h-4 w-4" aria-hidden />
            Nouvel objectif
          </button>
        </header>

        <section aria-label="Indicateurs objectifs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <DashboardToneKpiCard
              tone="blue"
              label="Progression globale"
              subtitle="Moyenne sur tous les objectifs"
              value={`${Math.min(progressionTotal, 100).toFixed(1)} %`}
              icon={<TrendingUp aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Objectifs actifs"
              subtitle="CA et volume clients"
              value={objectifs.length}
              icon={<Target aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Objectifs atteints"
              subtitle="Progression à 100 %"
              value={objectifsAtteints}
              icon={<CheckCircle2 aria-hidden />}
            />
          </div>
        </section>

        <section aria-label="Vos objectifs">
          <p className="mb-4 px-1 text-sm text-zinc-500">
            Une carte par objectif — la progression compare la cible au réalisé sur la période choisie.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
              <div
                className={`col-span-full ${objectifsFloatingCard} flex flex-col items-center justify-center px-6 py-14 text-center`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
                  <Target className="h-7 w-7" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="text-base font-semibold text-zinc-800">Aucun objectif pour l&apos;instant</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Définissez une cible CA ou nombre de clients avec{" "}
                  <span className="font-medium text-zinc-700">Nouvel objectif</span>.
                </p>
              </div>
            )}
          </div>
        </section>

        <section aria-label="Liste des objectifs">
          <ObjectifsTable objectifs={objectifs} onDelete={handleDeleteObjectif} onEdit={handleEditObjectif} />
        </section>

        {showForm ? (
          <ObjectifForm objectif={editingObjectif} onClose={() => setShowForm(false)} onSave={handleSaveObjectif} />
        ) : null}
      </div>
    </div>
  );
}
