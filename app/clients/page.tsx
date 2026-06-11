"use client";

import { useMemo, useState } from "react";
import { Users, UserPlus, UserCheck } from "lucide-react";
import DashboardToneKpiCard from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import ClientsTable from "./clients_components/ClientsTable";
import ClientForm from "./clients_components/ClientForm";
import type { Client } from "@/app/types";
import { countAbonnementPremiumClients } from "@/lib/abonnement";
import { useJsonBucket } from "@/hooks/useJsonBucket";

const clientsShellClass =
  "min-h-screen w-full bg-[#F5F5F7] text-zinc-900 p-3 sm:p-4 md:p-8 md:px-10 lg:px-12";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#6C5DD3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5B4CC7] w-full sm:w-auto";

export default function Clients() {
  const [clients, setClients] = useJsonBucket<Client[]>("clients", []);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      setClients(clients.map((c) => (c.id === client.id ? client : c)));
    } else {
      setClients([...clients, client]);
    }
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

  const { totalClients, activiteCeMois, abonnementActifs } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const activite = clients.filter((client) => {
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
    return {
      totalClients: clients.length,
      activiteCeMois: activite,
      abonnementActifs: countAbonnementPremiumClients(clients),
    };
  }, [clients]);

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className={clientsShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[32px] font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Clients
              </h1>
              <p className="mt-1 text-sm text-zinc-500 sm:text-[15px]">
                <span className="capitalize">{dateLabel}</span> · entreprises, contacts et CA issu de Finance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
              }}
              className={primaryButtonClass}
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Nouveau client
            </button>
          </div>
        </header>

        <section aria-label="Indicateurs clients">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <DashboardToneKpiCard
              tone="pink"
              label="Total clients"
              subtitle="Depuis toujours"
              value={totalClients}
              icon={<Users aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="violet"
              label="Activité ce mois"
              subtitle="Dernière activité datée ce mois-ci"
              value={activiteCeMois}
              icon={<UserPlus aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Abonnements actifs"
              subtitle="Performance ou Croissance"
              value={abonnementActifs}
              icon={<UserCheck aria-hidden />}
            />
          </div>
        </section>

        <section aria-label="Liste des clients">
          <ClientsTable
            clients={clients}
            onDelete={handleDeleteClient}
            onEdit={(client) => {
              setEditingClient(client);
              setShowForm(true);
            }}
          />
        </section>

        {showForm ? (
          <ClientForm
            key={editingClient?.id ?? "nouveau-client"}
            client={editingClient}
            onClose={() => setShowForm(false)}
            onSave={handleSaveClient}
          />
        ) : null}
      </div>
    </div>
  );
}
