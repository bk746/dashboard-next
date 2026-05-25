"use client";

import { Wallet } from "lucide-react";
import type { Depense } from "@/app/types";
import { financeFloatingCard, financePrimaryBtn } from "@/app/finance/financeUi";

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
    <div className={financeFloatingCard}>
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:px-6">
        <p className="text-sm font-semibold text-[#5E549E]">Liste des dépenses</p>
        <p className="mt-1 text-xs text-zinc-500">
          {isEmpty
            ? "Aucune dépense — ajoutez des charges pour la synthèse nette."
            : isPeriodEmpty
              ? `Aucune ligne sur la période (${totalAll} au total).`
              : `${depenses.length} ligne${depenses.length > 1 ? "s" : ""} sur la période affichée.`}
        </p>
      </div>

      {isPeriodEmpty ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-base font-medium text-zinc-800">Aucune dépense sur cette période</p>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            En « Mois en cours », seules les charges récurrentes et les dépenses occasionnelles datées ce mois
            apparaissent. Passez sur « Tout » pour la liste complète.
          </p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5DD3]/12 text-[#6C5DD3]">
            <Wallet className="h-7 w-7" strokeWidth={1.25} aria-hidden />
          </div>
          <p className="text-base font-semibold text-zinc-800">Aucune dépense</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Les dépenses alimentent la synthèse nette (encaissé − charges).
          </p>
          <button type="button" onClick={onAdd} className={`${financePrimaryBtn} mt-6`}>
            Ajouter une dépense
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Désignation
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Montant
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Type
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {depenses.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-[#6C5DD3]/[0.04]"
                >
                  <td className="p-4 text-sm text-zinc-800">{d.libelle}</td>
                  <td className="p-4 text-sm font-medium tabular-nums text-zinc-800">
                    {d.montant.toLocaleString("fr-FR")} €
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.type === "Récurrent"
                          ? "bg-amber-500/15 text-amber-900"
                          : "bg-zinc-200/90 text-zinc-700"
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
                        className="text-sm font-medium text-[#6C5DD3] hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Supprimer cette dépense ?")) onDelete(d.id);
                        }}
                        className="text-sm text-rose-600 hover:text-rose-700"
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
  );
}
