"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client, Facture, Projet } from "@/app/types";

interface ProjetFormProps {
  projet?: Projet | null;
  clients: Client[];
  factures: Facture[];
  onClose: () => void;
  onSave: (projet: Projet) => void;
}

export default function ProjetForm({ projet, clients, factures, onClose, onSave }: ProjetFormProps) {
  const [selectedFactureId, setSelectedFactureId] = useState<string>("");
  const [formData, setFormData] = useState<Omit<Projet, "id">>({
    nom: "",
    entreprise: "",
    statut: "Prospect",
    valeur: 0,
    dateDebut: new Date().toLocaleDateString("fr-FR"),
    dateFin: "",
    responsable: "",
    commentaire: "",
  });

  useEffect(() => {
    if (projet) {
      setSelectedFactureId("");
      setFormData({
        nom: projet.nom,
        entreprise: projet.entreprise,
        statut: projet.statut,
        valeur: projet.valeur,
        dateDebut: projet.dateDebut,
        dateFin: projet.dateFin,
        responsable: projet.responsable,
        commentaire: projet.commentaire || "",
      });
    } else {
      setSelectedFactureId("");
    }
  }, [projet]);

  const handleFactureChange = (factureId: string) => {
    setSelectedFactureId(factureId);
    if (!factureId) return;
    const facture = factures.find((f) => f.id === factureId);
    if (facture) {
      setFormData((prev) => ({
        ...prev,
        nom: facture.numeroFacture,
        entreprise: facture.entreprise,
        valeur: facture.prix,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projetToSave: Projet = {
      ...formData,
      id: projet?.id || Date.now().toString(),
    };
    onSave(projetToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {projet ? "Modifier le projet" : "Nouveau projet"}
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
            <label className="block text-gray-500 text-sm mb-2">Nom facture</label>
            <select
              value={selectedFactureId}
              onChange={(e) => handleFactureChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="">Aucune (remplir manuellement)</option>
              {factures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.numeroFacture} – {f.entreprise} – {f.prix.toLocaleString("fr-FR")} €
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Choisir une facture remplit automatiquement le nom, l’entreprise et la valeur.
            </p>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Nom du projet</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Entreprise</label>
            <select
              required
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="">Sélectionner une entreprise</option>
              {clients.map((client) => (
                <option key={client.id} value={client.entreprise}>
                  {client.entreprise}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Actif" | "Prospect" | "Terminé" })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="Actif">Actif</option>
              <option value="Prospect">Prospect</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Valeur (€)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.valeur}
                onChange={(e) => setFormData({ ...formData, valeur: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-2">Responsable</label>
              <input
                type="text"
                required
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
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

          <div>
            <label className="block text-gray-500 text-sm mb-2">Commentaire</label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              placeholder="Décrivez le projet..."
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 placeholder-gray-500 focus:outline-none focus:border-[#ED8600] resize-none"
            />
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
              {projet ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
