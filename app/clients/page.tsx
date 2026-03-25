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
} from "@/app/components/appCardStyles";
import TotalClientCard from "./clients_components/TotalClientCard";
import NouveauClientCard from "./clients_components/NouveauClientCard";
import AbonnementActifsCard from "./clients_components/AbonnementActifsCard";
import ClientsTable from "./clients_components/ClientsTable";
import ClientForm from "./clients_components/ClientForm";
import type { Client } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";

export default function Clients() {
  const [clients, setClients] = useJsonBucket<Client[]>("clients", []);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleSaveClient = (client: Client) => {
    let updatedClients: Client[];
    if (editingClient) {
      updatedClients = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedClients = [...clients, client];
    }
    setClients(updatedClients);
    setEditingClient(null);
    setShowForm(false);
  };

  const handleDeleteClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    const label = c?.entreprise ?? "ce client";
    if (
      !confirm(
        `Supprimer « ${label} » ?\n\nLes factures et projets ne sont pas supprimés automatiquement. Vérifiez la cohérence dans Finance et Deals / Projets si besoin.`
      )
    ) {
      return;
    }
    setClients(clients.filter((x) => x.id !== id));
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const totalClients = clients.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const activiteCeMois = clients.filter((client) => {
    try {
      const clientDate = new Date(client.derniereActivite.split("/").reverse().join("-"));
      return (
        !isNaN(clientDate.getTime()) &&
        clientDate.getMonth() === currentMonth &&
        clientDate.getFullYear() === currentYear
      );
    } catch {
      return false;
    }
  }).length;

  const abonnementActifs = clients.filter((c) => c.abonnement === "Actif").length;

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-7 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={pageEyebrowClass}>Gestion</p>
              <h1 className={pageTitleClass}>Clients</h1>
              <p className={pageSubtitleClass}>
                Annuaire entreprises et contacts. Le CA affiché est mis à jour depuis les factures payées (page Finance).
              </p>
            </div>
            <button type="button" onClick={handleNewClient} className={primaryButtonClass}>
              Nouveau client
            </button>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>
        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Vue d&apos;ensemble</h2>
            <p className={sectionIntroDescClass}>
              Volume total, activité sur le mois (champ « dernière activité ») et abonnements. Le CA client = somme des
              factures payées pour cette entreprise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <TotalClientCard totalClients={totalClients} />
            <NouveauClientCard activiteCeMois={activiteCeMois} />
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
