"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
}

interface ObjectifFormProps {
  objectif?: Objectif | null;
  onClose: () => void;
  onSave: (objectif: Objectif) => void;
}

export default function ObjectifForm({ objectif, onClose, onSave }: ObjectifFormProps) {
  const [formData, setFormData] = useState<Omit<Objectif, "id">>({
    type: "Financier",
    libelle: "",
    objectif: 0,
    dateDebut: new Date().toLocaleDateString("fr-FR"),
    dateFin: "",
  });

  useEffect(() => {
    if (objectif) {
      setFormData({
        type: objectif.type,
        libelle: objectif.libelle,
        objectif: objectif.objectif,
        dateDebut: objectif.dateDebut,
        dateFin: objectif.dateFin,
      });
    }
  }, [objectif]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const objectifToSave: Objectif = {
      ...formData,
      id: objectif?.id || Date.now().toString(),
    };
    onSave(objectifToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white text-xl font-bold">
            {objectif ? "Modifier l'objectif" : "Nouvel objectif"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-neutral-400 text-sm mb-2">Libellé</label>
            <input
              type="text"
              required
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              placeholder="Ex: Objectif 200 000€"
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "Financier" | "Client" })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            >
              <option value="Financier">Financier</option>
              <option value="Client">Client</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              Objectif {formData.type === "Financier" ? "(€)" : ""}
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.objectif}
              onChange={(e) => setFormData({ ...formData, objectif: parseInt(e.target.value) || 0 })}
              placeholder={formData.type === "Financier" ? "Ex: 200000" : "Ex: 100"}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Date de début</label>
              <input
                type="text"
                required
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-2">Date de fin</label>
              <input
                type="text"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-700 rounded-lg text-white hover:bg-neutral-900 transition-colors w-full sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] transition-colors w-full sm:w-auto"
            >
              {objectif ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
