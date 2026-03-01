"use client";

import { useState, useEffect } from "react";
import ValeurTotalCard from "./deals_projets_components/ValeurTotalCard";
import ProjetsActifsCard from "./deals_projets_components/ProjetsActifsCard";
import ProchaineEcheanceCard from "./deals_projets_components/ProchaineEcheanceCard";
import ProjetsTable from "./deals_projets_components/ProjetsTable";
import ProjetForm from "./deals_projets_components/ProjetForm";
import type { Client, Facture, Projet } from "@/app/types";

export default function DealsProjets() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProjet, setEditingProjet] = useState<Projet | null>(null);
  const [isInitialLoadClients, setIsInitialLoadClients] = useState(true);
  const [isInitialLoadProjets, setIsInitialLoadProjets] = useState(true);

  // Charger les clients depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        try {
          const parsedClients = JSON.parse(savedClients);
          setClients(parsedClients);
        } catch (error) {
          console.error("Erreur lors du chargement des clients:", error);
        }
      }
      setIsInitialLoadClients(false);
    }
  }, []);

  // Charger les factures depuis localStorage (pour lier projet ↔ facture)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFactures = localStorage.getItem("factures");
      if (savedFactures) {
        try {
          setFactures(JSON.parse(savedFactures));
        } catch (error) {
          console.error("Erreur lors du chargement des factures:", error);
        }
      }
    }
  }, []);

  // Charger les projets depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProjets = localStorage.getItem("projets");
      if (savedProjets) {
        try {
          const parsedProjets = JSON.parse(savedProjets);
          setProjets(parsedProjets);
        } catch (error) {
          console.error("Erreur lors du chargement des projets:", error);
        }
      }
      setIsInitialLoadProjets(false);
    }
  }, []);

  // Sauvegarder les projets dans localStorage à chaque modification (sauf au chargement initial)
  useEffect(() => {
    if (!isInitialLoadProjets && typeof window !== "undefined") {
      localStorage.setItem("projets", JSON.stringify(projets));
    }
  }, [projets, isInitialLoadProjets]);

  const handleSaveProjet = (projet: Projet) => {
    let updatedProjets: Projet[];
    if (editingProjet) {
      // Modifier un projet existant
      updatedProjets = projets.map((p) => (p.id === projet.id ? projet : p));
    } else {
      // Ajouter un nouveau projet
      updatedProjets = [...projets, projet];
    }
    setProjets(updatedProjets);
    // Sauvegarder immédiatement
    if (typeof window !== "undefined") {
      localStorage.setItem("projets", JSON.stringify(updatedProjets));
    }
    setEditingProjet(null);
    setShowForm(false);
  };

  const handleDeleteProjet = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      const updatedProjets = projets.filter((p) => p.id !== id);
      setProjets(updatedProjets);
      // Sauvegarder immédiatement
      if (typeof window !== "undefined") {
        localStorage.setItem("projets", JSON.stringify(updatedProjets));
      }
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

  // Calculer les statistiques
  const valeurTotal = projets.reduce((sum, projet) => sum + projet.valeur, 0);
  const projetsActifs = projets.filter((p) => p.statut === "Actif").length;

  // Prochaine échéance : date de fin la plus courte >= aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const projetsAvecDateFin = projets
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
    <div className="min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] dark:bg-black p-3 sm:p-4 md:p-8 md:px-10 lg:px-12">
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-[0.2em] font-medium mb-1 md:block">Pipeline</p>
              <h1 className="text-[#ED8600] dark:text-blue-800 font-bold text-2xl sm:text-xl md:text-[28px] tracking-tight">Deals / Projets</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-[15px] mt-0.5">Gestion et suivi de vos projets</p>
            </div>
            <button
              onClick={handleNewProjet}
              className="px-4 sm:px-6 py-2.5 bg-[#ED8600] dark:bg-blue-800 rounded-xl text-white font-medium text-sm sm:text-base w-full sm:w-auto shadow-lg shadow-[#ED8600]/25 dark:shadow-blue-800/25 hover:opacity-95 transition-all duration-200"
            >
              Nouveau projet
            </button>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent hidden md:block" />
        </header>
        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <ValeurTotalCard valeurTotal={valeurTotal} />
            <ProjetsActifsCard projetsActifs={projetsActifs} />
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
