"use client";

import { useState } from "react";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  primaryButtonClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
  staggerCardsGridClass,
} from "@/app/components/appCardStyles";
import ValeurTotalCard from "./deals_projets_components/ValeurTotalCard";
import ProjetsActifsCard from "./deals_projets_components/ProjetsActifsCard";
import ProchaineEcheanceCard from "./deals_projets_components/ProchaineEcheanceCard";
import ProjetsTable from "./deals_projets_components/ProjetsTable";
import ProjetForm from "./deals_projets_components/ProjetForm";
import type { Client, Facture, Projet } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";

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

  // Statistiques : pipeline = tout projet non terminé (suivi opérationnel)
  const projetsPipeline = projets.filter((p) => p.statut !== "Terminé");
  const valeurTotal = projetsPipeline.reduce((sum, projet) => sum + projet.valeur, 0);
  const projetsEnCours = projetsPipeline.length;

  // Prochaine échéance : parmi les projets en cours uniquement, date de fin >= aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const projetsAvecDateFin = projetsPipeline
    .filter((p) => p.dateFin && p.dateFin.trim() !== "")
    .map((p) => {
      const parts = p.dateFin.trim().split("/");
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      const dateFin = new Date(year, month, day);
      return { dateFin, dateFinStr: p.dateFin };
    })
    .filter((x): x is { dateFin: Date; dateFinStr: string } => x !== null && !isNaN(x.dateFin.getTime()));
  const echeancesFutures = projetsAvecDateFin
    .filter(({ dateFin }) => dateFin >= today)
    .sort((a, b) => a.dateFin.getTime() - b.dateFin.getTime());
  const prochaineEcheance = echeancesFutures.length > 0 ? echeancesFutures[0].dateFinStr : null;

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-7 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={pageEyebrowClass}>Pipeline</p>
              <h1 className={pageTitleClass}>Deals / Projets</h1>
              <p className={pageSubtitleClass}>Pipeline, montants et échéances de vos deals.</p>
            </div>
            <button type="button" onClick={handleNewProjet} className={primaryButtonClass}>
              Nouveau projet
            </button>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>
        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Vue d&apos;ensemble</h2>
            <p className={sectionIntroDescClass}>
              Montants et volume du pipeline (hors terminés), plus la prochaine échéance à venir.
            </p>
          </div>
          <div
            className={`grid ${staggerCardsGridClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6`}
          >
            <ValeurTotalCard valeurTotal={valeurTotal} />
            <ProjetsActifsCard projetsEnCours={projetsEnCours} />
            <ProchaineEcheanceCard prochaineEcheance={prochaineEcheance} />
          </div>
        </section>
        <section className="px-4 sm:px-6 md:px-0" aria-label="Liste des projets">
          <ProjetsTable projets={projets} onDelete={handleDeleteProjet} onEdit={handleEditProjet} />
        </section>
      {showForm && (
        <ProjetForm
          projet={editingProjet}
          clients={clients}
          factures={factures}
          onClose={() => setShowForm(false)}
          onSave={handleSaveProjet}
        />
      )}
      </div>
    </div>
  );
}
