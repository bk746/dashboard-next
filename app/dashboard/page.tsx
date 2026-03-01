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
    <div className="min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] dark:bg-black p-3 sm:p-4 md:p-8 md:px-10 lg:px-12">
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-[0.2em] font-medium mb-1 md:block">Tableau de bord</p>
            <h1 className="text-[#ED8600] dark:text-blue-800 font-bold text-2xl sm:text-xl md:text-[28px] tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-[15px] mt-0.5">Vue d'ensemble de votre activité</p>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent hidden md:block" />
        </header>

        <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <CACard caActuel={caActuel} variation={variationCA} />
            <ClientsActifCard clientsActifs={clientsActifs} variation={variationClients} />
            <ObjectifAnnuelCard
              caActuel={caActuel}
              objectif={objectifAnnuelValue}
              progression={progressionObjectif}
            />
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-0" aria-label="Graphiques">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <div className="lg:col-span-2 min-h-[400px] sm:min-h-[480px]">
              <EvolutionCACard data={evolutionCAData} />
            </div>
            <div className="min-h-[400px] sm:min-h-[480px]">
              <NouveauxClientsCard data={nouveauxClientsData} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
