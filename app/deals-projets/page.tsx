"use client";

import { useState, useEffect } from "react";
import ValeurTotalCard from "./deals_projets_components/ValeurTotalCard";
import ProjetsActifsCard from "./deals_projets_components/ProjetsActifsCard";
import ProjetsProspectCard from "./deals_projets_components/ProjetsProspectCard";
import ProjetsTable from "./deals_projets_components/ProjetsTable";
import ProjetForm from "./deals_projets_components/ProjetForm";

interface Client {
  id: string;
  entreprise: string;
}

interface Projet {
  id: string;
  nom: string;
  entreprise: string;
  statut: "Actif" | "Prospect" | "Terminé";
  valeur: number;
  dateDebut: string;
  dateFin: string;
  responsable: string;
  commentaire: string;
}

export default function DealsProjets() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
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
  const projetsProspect = projets.filter((p) => p.statut === "Prospect").length;

  return (
    <div className="min-h-screen w-full bg-[#000000] p-3 sm:p-4 md:p-6">
      <div className="px-4 sm:px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl">Deals / Projets</h2>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg">Gestion et suivi de vos projets</p>
          </div>
          <button
            onClick={handleNewProjet}
            className="px-4 sm:px-6 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Nouveau projet
          </button>
        </div>
        <hr className="text-neutral-400 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
        <ValeurTotalCard valeurTotal={valeurTotal} />
        <ProjetsActifsCard projetsActifs={projetsActifs} />
        <ProjetsProspectCard projetsProspect={projetsProspect} />
      </div>
      <ProjetsTable projets={projets} onDelete={handleDeleteProjet} onEdit={handleEditProjet} />
      {showForm && (
        <ProjetForm
          projet={editingProjet}
          clients={clients}
          onClose={() => setShowForm(false)}
          onSave={handleSaveProjet}
        />
      )}
    </div>
  );
}
