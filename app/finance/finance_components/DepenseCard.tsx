"use client";

import { FaWallet } from "react-icons/fa";
import type { Depense } from "@/app/types";

interface DepenseCardProps {
  depenses: Depense[];
}

export default function DepenseCard({ depenses }: DepenseCardProps) {
  const recurrent = depenses.filter((d) => d.type === "Récurrent");
  const occasionnel = depenses.filter((d) => d.type === "Occasionnel");
  const totalRecurrent = recurrent.reduce((s, d) => s + d.montant, 0);
  const totalOccasionnel = occasionnel.reduce((s, d) => s + d.montant, 0);
  const total = totalRecurrent + totalOccasionnel;

  return (
    <div className="rounded-2xl md:rounded-xl p-6 md:p-5 h-full flex justify-between overflow-hidden transition-all duration-300 ease-out
      bg-white dark:bg-black md:bg-linear-to-br md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] dark:md:from-black dark:md:via-black dark:md:to-blue-800 border border-neutral-300 dark:border-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl md:shadow-[#0000002b] dark:md:shadow-none hover:scale-[1.01] md:hover:scale-103">
      <div className="flex flex-col gap-3 md:gap-1.5 flex-1 min-w-0">
        <p className="text-gray-500 dark:text-gray-400 md:text-[#ED8600] dark:md:text-blue-800 text-xs md:text-lg font-medium md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">Dépenses</p>
        <p className="text-gray-800 dark:text-white md:text-gray-500 dark:md:text-gray-400 text-3xl md:text-[clamp(28px,3vw,40px)] font-bold md:font-semibold tracking-tight tabular-nums">
          {total.toLocaleString("fr-FR")} €
        </p>
        <div className="flex flex-col gap-1 mt-1 md:mt-2">
          {totalRecurrent > 0 && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs md:text-sm">
              <span className="px-2 py-0.5 rounded-lg md:rounded bg-amber-100 dark:bg-amber-900/30 md:bg-amber-200 text-amber-800 dark:text-amber-300 md:text-amber-900 text-xs">Récurrent / mois</span>
              <span>{totalRecurrent.toLocaleString("fr-FR")} €</span>
            </div>
          )}
          {totalOccasionnel > 0 && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs md:text-sm">
              <span className="px-2 py-0.5 rounded-lg md:rounded bg-gray-100 dark:bg-gray-800 md:bg-gray-300 text-gray-600 dark:text-gray-300 md:text-gray-700 text-xs">Occasionnel</span>
              <span>{totalOccasionnel.toLocaleString("fr-FR")} €</span>
            </div>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-shrink-0 items-start">
        <FaWallet className="h-10 w-10 sm:h-11 sm:w-11 text-[#ED8600]/80 dark:text-blue-800/80" />
      </div>
    </div>
  );
}
