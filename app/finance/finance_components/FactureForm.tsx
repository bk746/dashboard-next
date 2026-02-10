"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface Facture {
  id: string;
  numeroFacture: string;
  entreprise: string;
  statut: "Payé" | "Non payé";
  date: string;
  prix: number;
  abonnement: "Actif" | "Inactif";
}

interface Client {
  id: string;
  entreprise: string;
  abonnement?: "Actif" | "Inactif";
}

interface FactureFormProps {
  facture?: Facture | null;
  clients: Client[];
  onClose: () => void;
  onSave: (facture: Facture) => void;
}

export default function FactureForm({ facture, clients, onClose, onSave }: FactureFormProps) {
  const [formData, setFormData] = useState<Omit<Facture, "id">>({
    numeroFacture: "",
    entreprise: "",
    statut: "Non payé",
    date: new Date().toLocaleDateString("fr-FR"),
    prix: 0,
    abonnement: "Actif",
  });

  useEffect(() => {
    if (facture) {
      setFormData({
        numeroFacture: facture.numeroFacture,
        entreprise: facture.entreprise,
        statut: facture.statut,
        date: facture.date,
        prix: facture.prix,
        abonnement: facture.abonnement,
      });
    } else {
      // Générer un numéro de facture automatique
      const savedFactures = localStorage.getItem("factures");
      const factures = savedFactures ? JSON.parse(savedFactures) : [];
      const nextNumero = factures.length + 1;
      setFormData((prev) => ({
        ...prev,
        numeroFacture: `FAC-${String(nextNumero).padStart(6, "0")}`,
      }));
    }
  }, [facture]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const factureToSave: Facture = {
      ...formData,
      id: facture?.id || Date.now().toString(),
    };
    onSave(factureToSave);
    onClose();
  };

  const handleEntrepriseChange = (entreprise: string) => {
    // Trouver le client correspondant et récupérer son abonnement
    const client = clients.find((c) => c.entreprise === entreprise);
    setFormData({
      ...formData,
      entreprise,
      abonnement: client?.abonnement || "Actif",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white text-xl font-bold">
            {facture ? "Modifier la facture" : "Nouvelle facture"}
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
            <label className="block text-neutral-400 text-sm mb-2">Numéro de facture</label>
            <input
              type="text"
              required
              value={formData.numeroFacture}
              onChange={(e) => setFormData({ ...formData, numeroFacture: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">Entreprise</label>
            <select
              required
              value={formData.entreprise}
              onChange={(e) => handleEntrepriseChange(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Payé" | "Non payé" })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              >
                <option value="Payé">Payé</option>
                <option value="Non payé">Non payé</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Date</label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-2">Prix (€)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: parseInt(e.target.value) || 0 })}
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
              {facture ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
