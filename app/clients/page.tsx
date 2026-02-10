"use client";

import { useState, useEffect } from "react";
import TotalClientCard from "./clients_components/TotalClientCard";
import NouveauClientCard from "./clients_components/NouveauClientCard";
import PanierMoyenCard from "./clients_components/PanierMoyenCard";
import ClientsTable from "./clients_components/ClientsTable";
import ClientForm from "./clients_components/ClientForm";
import type { Client } from "@/app/clients/types";

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

  // Calculer le panier moyen (moyenne des CA totaux)
  const panierMoyen = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + client.caTotal, 0) / clients.length)
    : 0;

  return (
    <div className="min-h-screen w-full bg-[#000000] p-3 sm:p-4 md:p-6">
      <div className="px-4 sm:px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl">Clients</h2>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg">Gestion et suivi de vos clients</p>
          </div>
          <button
            onClick={handleNewClient}
            className="px-4 sm:px-6 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Nouveau client
          </button>
        </div>
        <hr className="text-neutral-400 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
        <TotalClientCard totalClients={totalClients} />
        <NouveauClientCard nouveauxClients={nouveauxClients} />
        <PanierMoyenCard panierMoyen={panierMoyen} />
      </div>
      <ClientsTable clients={clients} onDelete={handleDeleteClient} onEdit={handleEditClient} />
      {showForm && (
        <ClientForm client={editingClient} onClose={() => setShowForm(false)} onSave={handleSaveClient} />
      )}
    </div>
  );
}
