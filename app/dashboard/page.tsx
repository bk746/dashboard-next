"use client";

import { useState, useEffect } from "react";
import CACard from "./dashboard_components/CACard";
import ClientsActifCard from "./dashboard_components/ClientsActifCard";
import ObjectifAnnuelCard from "./dashboard_components/ObjectifAnnuelCard";
import EvolutionCACard from "./dashboard_components/EvolutionCACard";
import NouveauxClientsCard from "./dashboard_components/NouveauxClientsCard";

interface Facture {
  statut: string;
  prix: number;
  date: string;
}

interface Client {
  statut: string;
  derniereActivite: string;
}

interface Objectif {
  type: string;
  objectif: number;
}

export default function Dashboard() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Charger les factures
      const savedFactures = localStorage.getItem("factures");
      if (savedFactures) {
        try {
          setFactures(JSON.parse(savedFactures));
        } catch (error) {
          console.error("Erreur lors du chargement des factures:", error);
        }
      }

      // Charger les clients
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        try {
          setClients(JSON.parse(savedClients));
        } catch (error) {
          console.error("Erreur lors du chargement des clients:", error);
        }
      }

      // Charger les objectifs
      const savedObjectifs = localStorage.getItem("objectifs");
      if (savedObjectifs) {
        try {
          setObjectifs(JSON.parse(savedObjectifs));
        } catch (error) {
          console.error("Erreur lors du chargement des objectifs:", error);
        }
      }

      // Écouter les changements de localStorage
      const handleStorageChange = () => {
        const facturesData = localStorage.getItem("factures");
        if (facturesData) {
          try {
            setFactures(JSON.parse(facturesData));
          } catch (error) {
            console.error("Erreur lors du chargement des factures:", error);
          }
        }

        const clientsData = localStorage.getItem("clients");
        if (clientsData) {
          try {
            setClients(JSON.parse(clientsData));
          } catch (error) {
            console.error("Erreur lors du chargement des clients:", error);
          }
        }

        const objectifsData = localStorage.getItem("objectifs");
        if (objectifsData) {
          try {
            setObjectifs(JSON.parse(objectifsData));
          } catch (error) {
            console.error("Erreur lors du chargement des objectifs:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("facturesUpdated", handleStorageChange);
      window.addEventListener("clientsUpdated", handleStorageChange);
      window.addEventListener("objectifsUpdated", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("facturesUpdated", handleStorageChange);
        window.removeEventListener("clientsUpdated", handleStorageChange);
        window.removeEventListener("objectifsUpdated", handleStorageChange);
      };
    }
  }, []);

  // Calculer le CA actuel (factures payées)
  const caActuel = factures
    .filter((f) => f.statut === "Payé")
    .reduce((sum, facture) => sum + facture.prix, 0);

  // Calculer le CA du mois précédent
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const caMoisPrecedent = factures
    .filter((f) => {
      if (f.statut !== "Payé") return false;
      try {
        const factureDate = new Date(f.date.split("/").reverse().join("-"));
        return factureDate >= lastMonth && factureDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      } catch {
        return false;
      }
    })
    .reduce((sum, facture) => sum + facture.prix, 0);
  
  const variationCA = caMoisPrecedent > 0 ? ((caActuel - caMoisPrecedent) / caMoisPrecedent) * 100 : 0;

  // Calculer les clients actifs
  const clientsActifs = clients.filter((c) => c.statut === "Actif").length;
  
  // Calculer les clients actifs du mois précédent
  const clientsActifsMoisPrecedent = clients.filter((c) => {
    if (c.statut !== "Actif") return false;
    try {
      const clientDate = new Date(c.derniereActivite.split("/").reverse().join("-"));
      return clientDate >= lastMonth && clientDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } catch {
      return false;
    }
  }).length;
  
  const variationClients = clientsActifs - clientsActifsMoisPrecedent;

  // Calculer l'objectif annuel (premier objectif financier trouvé)
  const objectifAnnuel = objectifs.find((o) => o.type === "Financier");
  const objectifAnnuelValue = objectifAnnuel?.objectif || 0;
  const progressionObjectif = objectifAnnuelValue > 0 ? (caActuel / objectifAnnuelValue) * 100 : 0;

  // Calculer l'évolution du CA par mois
  const evolutionCAData = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i) + 1, 0);
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
    const revenue = factures
      .filter((f) => {
        if (f.statut !== "Payé") return false;
        try {
          const factureDate = new Date(f.date.split("/").reverse().join("-"));
          return factureDate >= monthDate && factureDate <= monthEnd;
        } catch {
          return false;
        }
      })
      .reduce((sum, facture) => sum + facture.prix, 0);

    return {
      month: monthNames[monthDate.getMonth()],
      revenue: revenue || 0,
    };
  });

  // Calculer les nouveaux clients par mois
  const nouveauxClientsData = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i) + 1, 0);
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
    const nouveauxClients = clients.filter((c) => {
      try {
        const clientDate = new Date(c.derniereActivite.split("/").reverse().join("-"));
        return clientDate >= monthDate && clientDate <= monthEnd;
      } catch {
        return false;
      }
    }).length;

    return {
      month: monthNames[monthDate.getMonth()],
      clients: nouveauxClients || 0,
    };
  });

  return (
    <div className="min-h-screen w-full bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <header className="mb-8 lg:mb-10">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre activité</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
          <CACard caActuel={caActuel} variation={variationCA} />
          <ClientsActifCard clientsActifs={clientsActifs} variation={variationClients} />
          <ObjectifAnnuelCard
            caActuel={caActuel}
            objectif={objectifAnnuelValue}
            progression={progressionObjectif}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 min-h-[380px] lg:min-h-[420px]">
            <EvolutionCACard data={evolutionCAData} />
          </div>
          <div className="min-h-[380px] lg:min-h-[420px]">
            <NouveauxClientsCard data={nouveauxClientsData} />
          </div>
        </section>
      </div>
    </div>
  );
}
