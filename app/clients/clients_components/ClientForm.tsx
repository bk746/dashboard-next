"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client } from "@/app/clients/types";

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    entreprise: "",
    patron: "",
    telephone: "",
    email: "",
    statut: "Actif",
    abonnement: "Actif",
    caTotal: 0,
    projets: {
      enCours: 0,
      actifs: 0,
      termines: 0,
    },
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
        caTotal: client.caTotal,
        projets: client.projets,
        derniereActivite: client.derniereActivite,
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientToSave: Client = {
      ...formData,
      id: client?.id || Date.now().toString(),
    };
    onSave(clientToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white text-xl font-bold">
            {client ? "Modifier le client" : "Nouveau client"}
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
            <label className="block text-neutral-400 text-sm mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              required
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Nom du patron</label>
            <input
              type="text"
              required
              value={formData.patron}
              onChange={(e) => setFormData({ ...formData, patron: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Téléphone</label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Actif" | "Inactif" | "Prospect" })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-2">Abonnement</label>
              <select
                value={formData.abonnement}
                onChange={(e) => setFormData({ ...formData, abonnement: e.target.value as "Actif" | "Inactif" })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">CA Total (€)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.caTotal}
              onChange={(e) => setFormData({ ...formData, caTotal: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Projets</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-400 text-xs mb-1">En cours</label>
                <input
                  type="number"
                  min="0"
                  value={formData.projets.enCours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projets: { ...formData.projets, enCours: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Actifs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.projets.actifs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projets: { ...formData.projets, actifs: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Terminés</label>
                <input
                  type="number"
                  min="0"
                  value={formData.projets.termines}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projets: { ...formData.projets, termines: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Dernière activité</label>
            <input
              type="text"
              required
              value={formData.derniereActivite}
              onChange={(e) => setFormData({ ...formData, derniereActivite: e.target.value })}
              placeholder="DD/MM/YYYY"
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
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
              {client ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
