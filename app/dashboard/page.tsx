"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Facture, Client, Objectif } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { isDateInMonth, isDateInCalendarYear } from "@/app/finance/utils";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
  panelSurfaceClass,
  primaryButtonClass,
} from "@/app/components/appCardStyles";
import CACard from "./dashboard_components/CACard";
import ClientsActifCard from "./dashboard_components/ClientsActifCard";
import ObjectifAnnuelCard from "./dashboard_components/ObjectifAnnuelCard";
import EvolutionCACard from "./dashboard_components/EvolutionCACard";
import NouveauxClientsCard from "./dashboard_components/NouveauxClientsCard";
import DashboardQuickLinks from "./dashboard_components/DashboardQuickLinks";
import DashboardFinanceHint from "./dashboard_components/DashboardFinanceHint";

function countActifsWithActiviteInMonth(clients: Client[], year: number, month: number): number {
  return clients.filter((c) => {
    if (c.statut !== "Actif") return false;
    return isDateInMonth(c.derniereActivite, year, month);
  }).length;
}

export default function Dashboard() {
  const [factures] = useJsonBucket<Facture[]>("factures", []);
  const [clients] = useJsonBucket<Client[]>("clients", []);
  const [objectifs] = useJsonBucket<Objectif[]>("objectifs", []);

  const currentDate = useMemo(() => new Date(), []);
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  const caMoisEncaisse = useMemo(
    () =>
      factures
        .filter((f) => f.statut === "Payé" && isDateInMonth(f.date, y, m))
        .reduce((sum, f) => sum + f.prix, 0),
    [factures, y, m]
  );

  const prevMonthDate = useMemo(() => new Date(y, m - 1, 1), [y, m]);
  const py = prevMonthDate.getFullYear();
  const pm = prevMonthDate.getMonth();

  const caMoisPrecedent = useMemo(
    () =>
      factures
        .filter((f) => f.statut === "Payé" && isDateInMonth(f.date, py, pm))
        .reduce((sum, f) => sum + f.prix, 0),
    [factures, py, pm]
  );

  const variationCAPct = useMemo(() => {
    if (caMoisPrecedent <= 0) return null;
    return ((caMoisEncaisse - caMoisPrecedent) / caMoisPrecedent) * 100;
  }, [caMoisEncaisse, caMoisPrecedent]);

  const clientsActifs = useMemo(() => clients.filter((c) => c.statut === "Actif").length, [clients]);

  const activiteActifsCeMois = useMemo(() => countActifsWithActiviteInMonth(clients, y, m), [clients, y, m]);

  const activiteActifsMoisPrec = useMemo(() => countActifsWithActiviteInMonth(clients, py, pm), [clients, py, pm]);

  const deltaActiviteVsMoisPrec = activiteActifsCeMois - activiteActifsMoisPrec;

  const objectifFinancier = useMemo(
    () => objectifs.find((o) => o.type === "Financier"),
    [objectifs]
  );

  const objectifAnnuelValue = objectifFinancier?.objectif ?? 0;

  const caAnneeCours = useMemo(
    () =>
      factures
        .filter((f) => f.statut === "Payé" && isDateInCalendarYear(f.date, y))
        .reduce((sum, f) => sum + f.prix, 0),
    [factures, y]
  );

  const progressionObjectif =
    objectifAnnuelValue > 0 ? (caAnneeCours / objectifAnnuelValue) * 100 : 0;

  const montantImpayes = useMemo(
    () => factures.filter((f) => f.statut === "Non payé").reduce((s, f) => s + f.prix, 0),
    [factures]
  );

  const nbFacturesImpayees = useMemo(() => factures.filter((f) => f.statut === "Non payé").length, [factures]);

  const evolutionCAData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
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
  }, [factures, currentDate]);

  const activiteClientsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - i) + 1, 0);
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

      const count = clients.filter((c) => {
        try {
          const clientDate = new Date(c.derniereActivite.split("/").reverse().join("-"));
          return clientDate >= monthDate && clientDate <= monthEnd;
        } catch {
          return false;
        }
      }).length;

      return {
        month: monthNames[monthDate.getMonth()],
        clients: count || 0,
      };
    });
  }, [clients, currentDate]);

  const hasNoData = factures.length === 0 && clients.length === 0;

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <div>
            <p className={pageEyebrowClass}>Tableau de bord</p>
            <h1 className={pageTitleClass}>Dashboard</h1>
            <p className={pageSubtitleClass}>
              Indicateurs cohérents mois à mois, objectif sur l&apos;année en cours, tendances sur 12 mois.
            </p>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>

        <div className="mb-6 space-y-4 px-4 sm:px-6 md:px-0">
          <DashboardQuickLinks />
          <DashboardFinanceHint montantImpayes={montantImpayes} nbFacturesImpayees={nbFacturesImpayees} />
        </div>

        {hasNoData ? (
          <div className="px-4 sm:px-6 md:px-0 mb-8">
            <div className={`${panelSurfaceClass} p-8 text-center`}>
              <p className="text-zinc-800 dark:text-zinc-200 font-medium">Votre tableau de bord est vide</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Ajoutez des clients, des factures et des objectifs pour voir les graphiques et les tendances.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/finance" className={primaryButtonClass}>
                  Aller à Finance
                </Link>
                <Link href="/clients" className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9] py-2.5 px-4">
                  Clients
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {factures.length === 0 ? (
              <div className="px-4 sm:px-6 md:px-0 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  Aucune facture enregistrée : le CA et les graphiques d&apos;encaissement restent à zéro.{" "}
                  <Link href="/finance" className="font-medium underline underline-offset-2">
                    Créer une facture dans Finance
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            <section className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8" aria-label="Indicateurs">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Indicateurs clés</h2>
            <p className={sectionIntroDescClass}>
              CA du mois en cours vs mois précédent, volume de clients actifs et mouvement d&apos;activité (dernière
              date), progression vers le premier objectif financier sur l&apos;année civile (CA encaissé cumulé).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <CACard caMoisEncaisse={caMoisEncaisse} variationPct={variationCAPct} />
            <ClientsActifCard clientsActifs={clientsActifs} deltaActiviteVsMoisPrec={deltaActiviteVsMoisPrec} />
            <ObjectifAnnuelCard
              caAnneeCours={caAnneeCours}
              objectif={objectifAnnuelValue}
              progression={progressionObjectif}
              objectifLibelle={objectifFinancier?.libelle}
            />
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-0" aria-label="Graphiques">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Tendances</h2>
            <p className={sectionIntroDescClass}>
              Encaissements par mois et répartition de l&apos;activité client (champ « dernière activité ») sur 12 mois
              glissants.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
            <div className="lg:col-span-2 min-h-[380px] sm:min-h-[440px]">
              <EvolutionCACard data={evolutionCAData} />
            </div>
            <div className="min-h-[380px] sm:min-h-[440px]">
              <NouveauxClientsCard data={activiteClientsData} />
            </div>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}
