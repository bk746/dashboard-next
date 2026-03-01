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
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {objectif ? "Modifier l'objectif" : "Nouvel objectif"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-500 text-sm mb-2">Libellé</label>
            <input
              type="text"
              required
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              placeholder="Ex: Objectif 200 000€"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "Financier" | "Client" })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="Financier">Financier</option>
              <option value="Client">Client</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Objectif {formData.type === "Financier" ? "(€)" : ""}
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.objectif}
              onChange={(e) => setFormData({ ...formData, objectif: parseInt(e.target.value) || 0 })}
              placeholder={formData.type === "Financier" ? "Ex: 200000" : "Ex: 100"}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Date de début</label>
              <input
                type="text"
                required
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-2">Date de fin</label>
              <input
                type="text"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ED8600] rounded-lg text-white hover:opacity-90 transition-colors w-full sm:w-auto"
            >
              {objectif ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
