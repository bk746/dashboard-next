"use client";

import { useState, useEffect } from "react";
import ProgressionTotalCard from "./objectifs_components/ProgressionTotalCard";
import ObjectifCard from "./objectifs_components/ObjectifCard";
import ObjectifsTable from "./objectifs_components/ObjectifsTable";
import ObjectifForm from "./objectifs_components/ObjectifForm";

interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
}

interface Facture {
  statut: string;
  prix: number;
}

interface Client {
  id: string;
}

export default function Objectifs() {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<Objectif | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Charger les objectifs depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedObjectifs = localStorage.getItem("objectifs");
      if (savedObjectifs) {
        try {
          const parsedObjectifs = JSON.parse(savedObjectifs);
          setObjectifs(parsedObjectifs);
        } catch (error) {
          console.error("Erreur lors du chargement des objectifs:", error);
        }
      }

      // Charger les factures pour calculer le CA actuel
      const savedFactures = localStorage.getItem("factures");
      if (savedFactures) {
        try {
          const parsedFactures = JSON.parse(savedFactures);
          setFactures(parsedFactures);
        } catch (error) {
          console.error("Erreur lors du chargement des factures:", error);
        }
      }

      // Charger les clients pour calculer le nombre actuel
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        try {
          const parsedClients = JSON.parse(savedClients);
          setClients(parsedClients);
        } catch (error) {
          console.error("Erreur lors du chargement des clients:", error);
        }
      }

      setIsInitialLoad(false);
    }
  }, []);

  // Sauvegarder les objectifs dans localStorage à chaque modification (sauf au chargement initial)
  useEffect(() => {
    if (!isInitialLoad && typeof window !== "undefined") {
      localStorage.setItem("objectifs", JSON.stringify(objectifs));
    }
  }, [objectifs, isInitialLoad]);

  // Écouter les changements de factures et clients
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        const savedFactures = localStorage.getItem("factures");
        if (savedFactures) {
          try {
            setFactures(JSON.parse(savedFactures));
          } catch (error) {
            console.error("Erreur lors du chargement des factures:", error);
          }
        }

        const savedClients = localStorage.getItem("clients");
        if (savedClients) {
          try {
            setClients(JSON.parse(savedClients));
          } catch (error) {
            console.error("Erreur lors du chargement des clients:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      // Écouter aussi les événements personnalisés pour les changements dans la même page
      window.addEventListener("clientsUpdated", handleStorageChange);
      window.addEventListener("facturesUpdated", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("clientsUpdated", handleStorageChange);
        window.removeEventListener("facturesUpdated", handleStorageChange);
      };
    }
  }, []);

  const handleSaveObjectif = (objectif: Objectif) => {
    let updatedObjectifs: Objectif[];
    if (editingObjectif) {
      // Modifier un objectif existant
      updatedObjectifs = objectifs.map((o) => (o.id === objectif.id ? objectif : o));
    } else {
      // Ajouter un nouvel objectif
      updatedObjectifs = [...objectifs, objectif];
    }
    setObjectifs(updatedObjectifs);
    // Sauvegarder immédiatement
    if (typeof window !== "undefined") {
      localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs));
    }
    setEditingObjectif(null);
    setShowForm(false);
  };

  const handleDeleteObjectif = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      const updatedObjectifs = objectifs.filter((o) => o.id !== id);
      setObjectifs(updatedObjectifs);
      // Sauvegarder immédiatement
      if (typeof window !== "undefined") {
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs));
      }
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

  // Calculer les valeurs actuelles
  const caActuel = factures
    .filter((f) => f.statut === "Payé")
    .reduce((sum, facture) => sum + facture.prix, 0);
  
  const clientsActuels = clients.length;

  // Calculer la progression totale (moyenne des progressions de tous les objectifs)
  const progressions = objectifs.map((obj) => {
    const actuel = obj.type === "Financier" ? caActuel : clientsActuels;
    return obj.objectif > 0 ? Math.min((actuel / obj.objectif) * 100, 100) : 0;
  });
  const progressionTotal = progressions.length > 0
    ? progressions.reduce((sum, p) => sum + p, 0) / progressions.length
    : 0;

  return (
    <div className="min-h-screen w-full bg-[#000000] p-3 sm:p-4 md:p-6">
      <div className="px-4 sm:px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl">Objectifs</h2>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg">Suivi et gestion de vos objectifs</p>
          </div>
          <button
            onClick={handleNewObjectif}
            className="px-4 sm:px-6 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Nouvel objectif
          </button>
        </div>
        <hr className="text-neutral-400 w-full" />
      </div>

      {/* Grande barre de progression */}
      <div className="px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 md:pt-10">
        <ProgressionTotalCard progressionTotal={progressionTotal} />
      </div>

      {/* Cartes d'objectifs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
        {objectifs.map((objectif) => {
          const actuel = objectif.type === "Financier" ? caActuel : clientsActuels;
          return (
            <ObjectifCard
              key={objectif.id}
              type={objectif.type}
              objectif={objectif.objectif}
              actuel={actuel}
              libelle={objectif.libelle}
            />
          );
        })}
        {objectifs.length === 0 && (
          <div className="col-span-full text-center text-neutral-400 py-10">
            Aucun objectif défini. Créez votre premier objectif !
          </div>
        )}
      </div>

      <ObjectifsTable objectifs={objectifs} onDelete={handleDeleteObjectif} onEdit={handleEditObjectif} />
      {showForm && (
        <ObjectifForm
          objectif={editingObjectif}
          onClose={() => setShowForm(false)}
          onSave={handleSaveObjectif}
        />
      )}
    </div>
  );
}
