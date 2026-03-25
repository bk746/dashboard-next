import Link from "next/link";
import { panelSurfaceClass } from "@/app/components/appCardStyles";

interface DashboardFinanceHintProps {
  montantImpayes: number;
  nbFacturesImpayees: number;
}

export default function DashboardFinanceHint({ montantImpayes, nbFacturesImpayees }: DashboardFinanceHintProps) {
  return (
    <div
      className={`${panelSurfaceClass} flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4`}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Trésorerie</p>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Factures non payées :{" "}
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {montantImpayes.toLocaleString("fr-FR")} €
          </span>
          {nbFacturesImpayees > 0 ? (
            <span className="text-zinc-500 dark:text-zinc-400"> ({nbFacturesImpayees} facture{nbFacturesImpayees > 1 ? "s" : ""})</span>
          ) : null}
        </p>
      </div>
      <Link
        href="/finance"
        className="text-sm font-medium text-[#ED8600] underline-offset-2 hover:underline dark:text-[#8fa9c9] shrink-0"
      >
        Ouvrir Finance →
      </Link>
    </div>
  );
}
