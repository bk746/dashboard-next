"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Depense } from "@/app/types";
import { overlayBackdropClass, overlayScrollBodyClass, secondaryButtonClass } from "@/app/components/appCardStyles";
import {
  financeLightPanel,
  financeLightInput,
  financeLightLabel,
  financeVioletPrimaryBtn,
} from "@/app/finance/financeUi";

interface DepenseFormProps {
  depense?: Depense | null;
  onClose: () => void;
  onSave: (depense: Depense) => void;
}

export default function DepenseForm({ depense, onClose, onSave }: DepenseFormProps) {
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState<number>(0);
  const [type, setType] = useState<"Récurrent" | "Occasionnel">("Occasionnel");
  const [date, setDate] = useState(new Date().toLocaleDateString("fr-FR"));

  useEffect(() => {
    if (depense) {
      setLibelle(depense.libelle);
      setMontant(depense.montant);
      setType(depense.type);
      setDate(depense.date ?? new Date().toLocaleDateString("fr-FR"));
    } else {
      setDate(new Date().toLocaleDateString("fr-FR"));
    }
  }, [depense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const depenseToSave: Depense = {
      id: depense?.id ?? Date.now().toString(),
      libelle: libelle.trim(),
      montant,
      type,
      date: type === "Occasionnel" ? date : undefined,
    };
    onSave(depenseToSave);
    onClose();
  };

  const title = depense ? "Modifier la dépense" : "Nouvelle dépense";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={financeLightPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="depense-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="depense-form-title" className="text-lg font-semibold tracking-tight text-[#5E549E] pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fermer"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={financeLightLabel}>Désignation</label>
              <input
                type="text"
                required
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                className={financeLightInput}
              />
            </div>
            <div>
              <label className={financeLightLabel}>Montant (€)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={montant || ""}
                onChange={(e) => setMontant(Number(e.target.value) || 0)}
                className={financeLightInput}
              />
            </div>
            <div>
              <label className={financeLightLabel}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "Récurrent" | "Occasionnel")}
                className={financeLightInput}
              >
                <option value="Occasionnel">Occasionnel (une fois)</option>
                <option value="Récurrent">Récurrent (tous les mois)</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                {type === "Récurrent" ? "Dépense qui revient chaque mois." : "Dépense ponctuelle, non répétée."}
              </p>
            </div>
            {type === "Occasionnel" && (
              <div>
                <label className={financeLightLabel}>Date (optionnel)</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={financeLightInput}
                />
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={financeVioletPrimaryBtn}>
              {depense ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
