"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface Projet {
  id: string;
  nom: string;
  entreprise: string;
  statut: "Actif" | "Prospect" | "Terminé";
  valeur: number;
  dateDebut: string;
  dateFin: string;
  responsable: string;
  commentaire: string;
}

interface Client {
  id: string;
  entreprise: string;
}

interface ProjetFormProps {
  projet?: Projet | null;
  clients: Client[];
  onClose: () => void;
  onSave: (projet: Projet) => void;
}

export default function ProjetForm({ projet, clients, onClose, onSave }: ProjetFormProps) {
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
    }
  }, [projet]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white text-xl font-bold">
            {projet ? "Modifier le projet" : "Nouveau projet"}
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
            <label className="block text-neutral-400 text-sm mb-2">Nom du projet</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Entreprise</label>
            <select
              required
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
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
            <label className="block text-neutral-400 text-sm mb-2">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Actif" | "Prospect" | "Terminé" })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            >
              <option value="Actif">Actif</option>
              <option value="Prospect">Prospect</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Valeur (€)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.valeur}
                onChange={(e) => setFormData({ ...formData, valeur: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-2">Responsable</label>
              <input
                type="text"
                required
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>
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

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Commentaire</label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              placeholder="Décrivez le projet..."
              rows={4}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#1A10AC] resize-none"
            />
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
              {projet ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
