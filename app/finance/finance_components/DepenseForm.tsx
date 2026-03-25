"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Depense } from "@/app/types";
import {
  overlayBackdropClass,
  overlayPanelNarrowClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
  inputFieldClass,
  formLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/app/components/appCardStyles";

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
        className={overlayPanelNarrowClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="depense-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="depense-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Désignation</label>
              <input
                type="text"
                required
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                className={inputFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>Montant (€)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={montant || ""}
                onChange={(e) => setMontant(Number(e.target.value) || 0)}
                className={inputFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "Récurrent" | "Occasionnel")}
                className={inputFieldClass}
              >
                <option value="Occasionnel">Occasionnel (une fois)</option>
                <option value="Récurrent">Récurrent (tous les mois)</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {type === "Récurrent" ? "Dépense qui revient chaque mois." : "Dépense ponctuelle, non répétée."}
              </p>
            </div>
            {type === "Occasionnel" && (
              <div>
                <label className={formLabelClass}>Date (optionnel)</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={inputFieldClass}
                />
              </div>
            )}
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {depense ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
