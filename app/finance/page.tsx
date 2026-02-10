"use client";

import { useState, useEffect } from "react";
import RevenueEncaisseCard from "./finance_components/RevenueEncaisseCard";
import EnAttenteCard from "./finance_components/EnAttenteCard";
import EnRetardCard from "./finance_components/EnRetardCard";
import BeneficeNetCard from "./finance_components/BeneficeNetCard";
import FacturesTable from "./finance_components/FacturesTable";
import FactureForm from "./finance_components/FactureForm";

interface Client {
  id: string;
  entreprise: string;
  caTotal: number;
  abonnement?: "Actif" | "Inactif";
}

interface Facture {
  id: string;
  numeroFacture: string;
  entreprise: string;
  statut: "Payé" | "Non payé";
  date: string;
  prix: number;
  abonnement: "Actif" | "Inactif";
}

export default function Finance() {
  const [clients, setClients] = useState<Client[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [isInitialLoadClients, setIsInitialLoadClients] = useState(true);
  const [isInitialLoadFactures, setIsInitialLoadFactures] = useState(true);

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

  // Charger les factures depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFactures = localStorage.getItem("factures");
      if (savedFactures) {
        try {
          const parsedFactures = JSON.parse(savedFactures);
          setFactures(parsedFactures);
          // Synchroniser le CA total des clients au chargement initial
          if (parsedFactures.length > 0) {
            const savedClients = localStorage.getItem("clients");
            if (savedClients) {
              const allClients = JSON.parse(savedClients);
              const updatedClients = allClients.map((client: any) => {
                const clientCaTotal = parsedFactures
                  .filter((f: Facture) => f.entreprise === client.entreprise)
                  .reduce((sum: number, facture: Facture) => sum + facture.prix, 0);
                
                return {
                  ...client,
                  caTotal: clientCaTotal,
                };
              });
              setClients(updatedClients);
              localStorage.setItem("clients", JSON.stringify(updatedClients));
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des factures:", error);
        }
      }
      setIsInitialLoadFactures(false);
    }
  }, []);

  // Sauvegarder les factures dans localStorage à chaque modification (sauf au chargement initial)
  useEffect(() => {
    if (!isInitialLoadFactures && typeof window !== "undefined") {
      localStorage.setItem("factures", JSON.stringify(factures));
    }
  }, [factures, isInitialLoadFactures]);

  // Calculer les statistiques financières à partir des factures
  const revenueEncaisse = factures
    .filter((f) => f.statut === "Payé")
    .reduce((sum, facture) => sum + facture.prix, 0);
  
  const enAttente = factures
    .filter((f) => f.statut === "Non payé")
    .reduce((sum, facture) => sum + facture.prix, 0);
  
  const enRetard = 0; // À implémenter selon vos besoins (basé sur les dates)
  
  const beneficeNet = revenueEncaisse - enAttente - enRetard;

  // Fonction pour mettre à jour le CA total de chaque client basé sur leurs factures
  const updateClientsCaTotal = (facturesList: Facture[]) => {
    if (typeof window !== "undefined") {
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        try {
          const allClients = JSON.parse(savedClients);
          const updatedClients = allClients.map((client: any) => {
            // Calculer le CA total pour ce client en sommant toutes ses factures
            const clientCaTotal = facturesList
              .filter((f) => f.entreprise === client.entreprise)
              .reduce((sum, facture) => sum + facture.prix, 0);
            
            return {
              ...client,
              caTotal: clientCaTotal,
            };
          });
          
          setClients(updatedClients);
          localStorage.setItem("clients", JSON.stringify(updatedClients));
        } catch (error) {
          console.error("Erreur lors de la mise à jour du CA total des clients:", error);
        }
      }
    }
  };

  const handleSaveFacture = (facture: Facture) => {
    let updatedFactures: Facture[];
    if (editingFacture) {
      // Modifier une facture existante
      updatedFactures = factures.map((f) => (f.id === facture.id ? facture : f));
    } else {
      // Ajouter une nouvelle facture
      updatedFactures = [...factures, facture];
    }
    setFactures(updatedFactures);
    // Sauvegarder immédiatement
    if (typeof window !== "undefined") {
      localStorage.setItem("factures", JSON.stringify(updatedFactures));
    }
    // Mettre à jour le CA total des clients
    updateClientsCaTotal(updatedFactures);
    setEditingFacture(null);
    setShowForm(false);
  };

  const handleDeleteFacture = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      const updatedFactures = factures.filter((f) => f.id !== id);
      setFactures(updatedFactures);
      // Sauvegarder immédiatement
      if (typeof window !== "undefined") {
        localStorage.setItem("factures", JSON.stringify(updatedFactures));
      }
      // Mettre à jour le CA total des clients après suppression
      updateClientsCaTotal(updatedFactures);
    }
  };

  const handleEditFacture = (facture: Facture) => {
    setEditingFacture(facture);
    setShowForm(true);
  };

  const handleNewFacture = () => {
    setEditingFacture(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] p-3 sm:p-4 md:p-6">
      <div className="px-4 sm:px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl">Finance</h2>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg">Gestion et suivi de vos finances</p>
          </div>
          <button
            onClick={handleNewFacture}
            className="px-4 sm:px-6 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Nouvelle facture
          </button>
        </div>
        <hr className="text-neutral-400 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
        <RevenueEncaisseCard revenueEncaisse={revenueEncaisse} />
        <EnAttenteCard enAttente={enAttente} />
        <EnRetardCard enRetard={enRetard} />
        <BeneficeNetCard beneficeNet={beneficeNet} />
      </div>
      <FacturesTable factures={factures} onDelete={handleDeleteFacture} onEdit={handleEditFacture} />
      {showForm && (
        <FactureForm
          facture={editingFacture}
          clients={clients}
          onClose={() => setShowForm(false)}
          onSave={handleSaveFacture}
        />
      )}
    </div>
  );
}
