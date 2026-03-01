"use client";

import { useState, useEffect } from "react";
import TotalClientCard from "./clients_components/TotalClientCard";
import NouveauClientCard from "./clients_components/NouveauClientCard";
import AbonnementActifsCard from "./clients_components/AbonnementActifsCard";
import ClientsTable from "./clients_components/ClientsTable";
import ClientForm from "./clients_components/ClientForm";
import type { Client } from "@/app/types";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      setIsInitialLoad(false);
    }
  }, []);

  // Sauvegarder les clients dans localStorage à chaque modification (sauf au chargement initial)
  useEffect(() => {
    if (!isInitialLoad && typeof window !== "undefined") {
      localStorage.setItem("clients", JSON.stringify(clients));
    }
  }, [clients, isInitialLoad]);

  const handleSaveClient = (client: Client) => {
    let updatedClients: Client[];
    if (editingClient) {
      // Modifier un client existant
      updatedClients = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      // Ajouter un nouveau client
      updatedClients = [...clients, client];
    }
    setClients(updatedClients);
    // Sauvegarder immédiatement
    if (typeof window !== "undefined") {
      localStorage.setItem("clients", JSON.stringify(updatedClients));
    }
    setEditingClient(null);
    setShowForm(false);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      const updatedClients = clients.filter((c) => c.id !== id);
      setClients(updatedClients);
      // Sauvegarder immédiatement
      if (typeof window !== "undefined") {
        localStorage.setItem("clients", JSON.stringify(updatedClients));
      }
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  // Calculer les statistiques
  const totalClients = clients.length;
  
  // Compter les nouveaux clients du mois en cours
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const nouveauxClients = clients.filter((client) => {
    const clientDate = new Date(client.derniereActivite.split("/").reverse().join("-"));
    return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
  }).length;

  // Compter les clients avec abonnement actif
  const abonnementActifs = clients.filter((c) => c.abonnement === "Actif").length;

  return (
    <div className="min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] p-3 sm:p-4 md:p-8 md:px-10 lg:px-12">
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium mb-1 md:block">Gestion</p>
              <h1 className="text-[#ED8600] font-bold text-2xl sm:text-xl md:text-[28px] tracking-tight">Clients</h1>
              <p className="text-gray-500 text-sm sm:text-base md:text-[15px] mt-0.5">Gestion et suivi de vos clients</p>
            </div>
            <button
              onClick={handleNewClient}
              className="px-4 sm:px-6 py-2.5 bg-[#ED8600] rounded-xl text-white font-medium text-sm sm:text-base w-full sm:w-auto shadow-lg shadow-[#ED8600]/25 hover:shadow-[#ED8600]/30 hover:opacity-95 transition-all duration-200"
            >
              Nouveau client
            </button>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden md:block" />
        </header>
        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <TotalClientCard totalClients={totalClients} />
            <NouveauClientCard nouveauxClients={nouveauxClients} />
            <AbonnementActifsCard abonnementActifs={abonnementActifs} />
          </div>
        </section>
        <section className="px-4 sm:px-6 md:px-0" aria-label="Liste des clients">
          <ClientsTable clients={clients} onDelete={handleDeleteClient} onEdit={handleEditClient} />
        </section>
      {showForm && (
        <ClientForm client={editingClient} onClose={() => setShowForm(false)} onSave={handleSaveClient} />
      )}
      </div>
    </div>
  );
}
