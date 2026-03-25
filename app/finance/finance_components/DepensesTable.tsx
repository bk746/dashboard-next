"use client";

import { Wallet } from "lucide-react";
import type { Depense } from "@/app/types";
import { panelSurfaceClass, sectionIntroTitleClass, sectionIntroDescClass, primaryButtonClass } from "@/app/components/appCardStyles";

interface DepensesTableProps {
  depenses: Depense[];
  /** Total lignes hors filtre période */
  totalInDatabase?: number;
  onEdit: (d: Depense) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function DepensesTable({ depenses, totalInDatabase, onEdit, onDelete, onAdd }: DepensesTableProps) {
  const totalAll = totalInDatabase ?? depenses.length;
  const isPeriodEmpty = depenses.length === 0 && totalAll > 0;
  const isEmpty = depenses.length === 0 && totalAll === 0;

  return (
    <div className="px-4 pb-4 sm:px-6 md:px-0 md:pb-6">
      <div className="mb-4">
        <h2 className={sectionIntroTitleClass}>Liste des dépenses</h2>
        <p className={sectionIntroDescClass}>
          {isEmpty
            ? "Aucune dépense enregistrée — ajoutez les charges récurrentes et ponctuelles pour affiner la synthèse nette."
            : isPeriodEmpty
              ? `Aucune ligne sur la période (${totalAll} au total). Les récurrentes comptent toujours pour le mois.`
              : `${depenses.length} ligne${depenses.length > 1 ? "s" : ""} — récurrentes (par mois) et occasionnelles datées dans la période affichée ci-dessus.`}
        </p>
      </div>

      <div className={`${panelSurfaceClass} overflow-hidden`}>
        {isPeriodEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Aucune dépense sur cette période</p>
            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              En « Mois en cours », seules les charges récurrentes et les dépenses occasionnelles datées ce mois apparaissent. Passez sur « Tout » pour la liste complète.
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-4 rounded-2xl bg-zinc-100 p-5 dark:bg-white/[0.06]">
              <Wallet className="h-11 w-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.25} aria-hidden />
            </div>
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Aucune dépense</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Les dépenses alimentent le calcul de la synthèse nette (encaissé − charges). Utilisez{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Nouvelle dépense</span> en haut de page.
            </p>
            <button type="button" onClick={onAdd} className={`${primaryButtonClass} mt-6 w-auto px-6`}>
              Ajouter une dépense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200/90 bg-zinc-50/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Désignation
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Montant
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Type
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {depenses.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="p-4 text-sm text-zinc-800 dark:text-zinc-200">{d.libelle}</td>
                    <td className="p-4 text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                      {d.montant.toLocaleString("fr-FR")} €
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.type === "Récurrent"
                            ? "bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                            : "bg-zinc-500/15 text-zinc-800 dark:bg-zinc-500/25 dark:text-zinc-200"
                        }`}
                      >
                        {d.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(d)}
                          className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9] hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(d.id)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
