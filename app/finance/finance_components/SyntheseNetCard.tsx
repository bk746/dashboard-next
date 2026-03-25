import { FaBalanceScale } from "react-icons/fa";
import { appCardKpi, kpiValueClass, kpiIconClass } from "@/app/components/appCardStyles";

interface SyntheseNetCardProps {
  net: number;
  periodLabel: string;
}

export default function SyntheseNetCard({ net, periodLabel }: SyntheseNetCardProps) {
  const positive = net >= 0;
  return (
    <div className={appCardKpi}>
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p
          className={
            positive
              ? "text-zinc-500 dark:text-zinc-500 text-xs md:text-lg font-medium md:font-semibold uppercase md:normal-case tracking-widest md:tracking-normal md:text-emerald-700 dark:md:text-emerald-400"
              : "text-zinc-500 dark:text-zinc-500 text-xs md:text-lg font-medium md:font-semibold uppercase md:normal-case tracking-widest md:tracking-normal md:text-rose-700 dark:md:text-rose-400"
          }
        >
          Synthèse nette
        </p>
        <p
          className={`${kpiValueClass} ${positive ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"}`}
        >
          {net.toLocaleString("fr-FR")} €
        </p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">
          Encaissé − dépenses ({periodLabel})
        </p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaBalanceScale
          className={`${kpiIconClass} ${positive ? "text-emerald-600/30 dark:text-emerald-400/25" : "text-rose-600/30 dark:text-rose-400/25"}`}
          aria-hidden
        />
      </div>
    </div>
  );
}
