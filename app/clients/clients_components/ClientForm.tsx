"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client } from "@/app/types";

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const [formData, setFormData] = useState<{
    entreprise: string;
    patron: string;
    telephone: string;
    email: string;
    statut: "Actif" | "Inactif" | "Prospect";
    abonnement: "Actif" | "Inactif";
    secteurActivite: string;
    derniereActivite: string;
  }>({
    entreprise: "",
    patron: "",
    telephone: "",
    email: "",
    statut: "Actif",
    abonnement: "Actif",
    secteurActivite: "",
    derniereActivite: new Date().toLocaleDateString("fr-FR"),
  });

  useEffect(() => {
    if (client) {
      setFormData({
        entreprise: client.entreprise,
        patron: client.patron,
        telephone: client.telephone,
        email: client.email,
        statut: client.statut,
        abonnement: client.abonnement || "Actif",
        secteurActivite: client.secteurActivite ?? "",
        derniereActivite: client.derniereActivite,
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientToSave: Client = {
      ...formData,
      id: client?.id || Date.now().toString(),
      caTotal: client?.caTotal ?? 0,
      projets: client?.projets ?? { enCours: 0, actifs: 0, termines: 0 },
    };
    onSave(clientToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {client ? "Modifier le client" : "Nouveau client"}
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
            <label className="block text-gray-500 text-sm mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              required
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Nom du patron</label>
            <input
              type="text"
              required
              value={formData.patron}
              onChange={(e) => setFormData({ ...formData, patron: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Téléphone</label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Actif" | "Inactif" | "Prospect" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-2">Abonnement</label>
              <select
                value={formData.abonnement}
                onChange={(e) => setFormData({ ...formData, abonnement: e.target.value as "Actif" | "Inactif" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Secteur d'activité</label>
            <input
              type="text"
              value={formData.secteurActivite}
              onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
              placeholder="Ex. Tech, Santé, BTP..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Dernière activité</label>
            <input
              type="text"
              required
              value={formData.derniereActivite}
              onChange={(e) => setFormData({ ...formData, derniereActivite: e.target.value })}
              placeholder="DD/MM/YYYY"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
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
              {client ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
