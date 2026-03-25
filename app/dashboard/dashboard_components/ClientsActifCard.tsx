import { FaUsers } from "react-icons/fa";
import {
  dashboardCardKpi,
  kpiLabelClass,
  kpiValueClass,
  kpiIconClass,
  badgePositiveClass,
  badgeNegativeClass,
} from "@/app/components/appCardStyles";

interface ClientsActifCardProps {
  clientsActifs: number;
  /** Écart du nombre de clients actifs ayant une activité datée ce mois vs le mois précédent (champ « dernière activité ») */
  deltaActiviteVsMoisPrec: number;
}

export default function ClientsActifCard({ clientsActifs, deltaActiviteVsMoisPrec }: ClientsActifCardProps) {
  const isPositive = deltaActiviteVsMoisPrec > 0;
  const absDelta = Math.abs(deltaActiviteVsMoisPrec);
  const label = absDelta <= 1 ? "client" : "clients";

  return (
    <div className={dashboardCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className={kpiLabelClass}>Clients actifs</p>
        <p className={kpiValueClass}>{clientsActifs}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm leading-snug">
          Total au statut « Actif ». Ci-dessous : mouvement d&apos;activité (dernière date) vs le mois dernier.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2">
          {deltaActiviteVsMoisPrec === 0 ? (
            <span className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
              Même niveau d&apos;activité qu&apos;au mois précédent
            </span>
          ) : (
            <>
              <span className={isPositive ? badgePositiveClass : badgeNegativeClass}>
                {isPositive ? "+" : "−"}
                {absDelta} {label}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm">activité vs mois précédent</span>
            </>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaUsers className={kpiIconClass} aria-hidden />
      </div>
    </div>
  );
}
