"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Depense } from "@/app/types";

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {depense ? "Modifier la dépense" : "Nouvelle dépense"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-600">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-500 text-sm mb-2">Désignation</label>
            <input
              type="text"
              required
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-2">Montant (€)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={montant || ""}
              onChange={(e) => setMontant(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "Récurrent" | "Occasionnel")}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="Occasionnel">Occasionnel (une fois)</option>
              <option value="Récurrent">Récurrent (tous les mois)</option>
            </select>
            <p className="text-gray-500 text-xs mt-1">
              {type === "Récurrent" ? "Dépense qui revient chaque mois." : "Dépense ponctuelle, non répétée."}
            </p>
          </div>
          {type === "Occasionnel" && (
            <div>
              <label className="block text-gray-500 text-sm mb-2">Date (optionnel)</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-200 w-full sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ED8600] rounded-lg text-white hover:opacity-90 w-full sm:w-auto"
            >
              {depense ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
