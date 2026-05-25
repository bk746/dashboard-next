"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Euro, FolderKanban, Plus } from "lucide-react";
import DashboardToneKpiCard from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import ProjetsTable from "./deals_projets_components/ProjetsTable";
import ProjetForm from "./deals_projets_components/ProjetForm";
import type { Client, Facture, Projet } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { dealsShellClass, dealsPrimaryBtn } from "./dealsProjetsUi";

function formatEuro(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

export default function DealsProjets() {
  const [clients] = useJsonBucket<Client[]>("clients", []);
  const [projets, setProjets] = useJsonBucket<Projet[]>("projets", []);
  const [factures] = useJsonBucket<Facture[]>("factures", []);
  const [showForm, setShowForm] = useState(false);
  const [editingProjet, setEditingProjet] = useState<Projet | null>(null);

  const handleSaveProjet = (projet: Projet) => {
    const updatedProjets = editingProjet
      ? projets.map((p) => (p.id === projet.id ? projet : p))
      : [...projets, projet];
    setProjets(updatedProjets);
    setEditingProjet(null);
    setShowForm(false);
  };

  const handleDeleteProjet = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      setProjets(projets.filter((p) => p.id !== id));
    }
  };

  const handleEditProjet = (projet: Projet) => {
    setEditingProjet(projet);
    setShowForm(true);
  };

  const handleNewProjet = () => {
    setEditingProjet(null);
    setShowForm(true);
  };

  const { valeurTotal, projetsEnCours, prochaineEcheance } = useMemo(() => {
    const pipeline = projets.filter((p) => p.statut !== "Terminé");
    const valeur = pipeline.reduce((sum, projet) => sum + projet.valeur, 0);
    const count = pipeline.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeancesFutures = pipeline
      .filter((p) => p.dateFin?.trim())
      .map((p) => {
        const parts = p.dateFin.trim().split("/");
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        const dateFin = new Date(year, month, day);
        if (isNaN(dateFin.getTime())) return null;
        return { dateFin, dateFinStr: p.dateFin };
      })
      .filter((x): x is { dateFin: Date; dateFinStr: string } => x !== null && x.dateFin >= today)
      .sort((a, b) => a.dateFin.getTime() - b.dateFin.getTime());

    return {
      valeurTotal: valeur,
      projetsEnCours: count,
      prochaineEcheance: echeancesFutures.length > 0 ? echeancesFutures[0].dateFinStr : null,
    };
  }, [projets]);

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className={dealsShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[#5E549E] sm:text-[28px]">
              Deals / Projets
            </h1>
            <p className="mt-1 text-sm text-zinc-500 capitalize">{dateLabel}</p>
          </div>
          <button type="button" onClick={handleNewProjet} className={dealsPrimaryBtn}>
            <Plus className="h-4 w-4" aria-hidden />
            Nouveau projet
          </button>
        </header>

        <section aria-label="Indicateurs pipeline">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <DashboardToneKpiCard
              tone="violet"
              label="Valeur pipeline"
              subtitle="Hors projets terminés"
              value={formatEuro(valeurTotal)}
              icon={<Euro aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Projets en cours"
              subtitle="Actifs et prospects"
              value={projetsEnCours}
              icon={<FolderKanban aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Prochaine échéance"
              subtitle="Date de fin la plus proche"
              value={prochaineEcheance ?? "—"}
              icon={<CalendarClock aria-hidden />}
            />
          </div>
        </section>

        <section aria-label="Liste des projets">
          <ProjetsTable projets={projets} onDelete={handleDeleteProjet} onEdit={handleEditProjet} />
        </section>

        {showForm ? (
          <ProjetForm
            projet={editingProjet}
            clients={clients}
            factures={factures}
            onClose={() => setShowForm(false)}
            onSave={handleSaveProjet}
          />
        ) : null}
      </div>
    </div>
  );
}
