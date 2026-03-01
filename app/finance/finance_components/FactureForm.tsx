"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client, Devis, Facture } from "@/app/types";

interface FactureFormProps {
  facture?: Facture | null;
  fromDevis?: Devis | null;
  clients: Client[];
  onClose: () => void;
  onSave: (facture: Facture) => void;
}

export default function FactureForm({ facture, fromDevis, clients, onClose, onSave }: FactureFormProps) {
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
    } else if (fromDevis) {
      const savedFactures = localStorage.getItem("factures");
      const factures = savedFactures ? JSON.parse(savedFactures) : [];
      const nextNumero = factures.length + 1;
      setFormData({
        numeroFacture: `FAC-${String(nextNumero).padStart(6, "0")}`,
        entreprise: fromDevis.entreprise,
        statut: "Non payé",
        date: new Date().toLocaleDateString("fr-FR"),
        prix: fromDevis.prix,
        abonnement: fromDevis.abonnement,
      });
    } else {
      const savedFactures = localStorage.getItem("factures");
      const factures = savedFactures ? JSON.parse(savedFactures) : [];
      const nextNumero = factures.length + 1;
      setFormData((prev) => ({
        ...prev,
        numeroFacture: `FAC-${String(nextNumero).padStart(6, "0")}`,
      }));
    }
  }, [facture, fromDevis]);

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
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {facture ? "Modifier la facture" : fromDevis ? `Facture à partir du devis ${fromDevis.numeroDevis}` : "Nouvelle facture"}
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
            <label className="block text-gray-500 text-sm mb-2">Numéro de facture</label>
            <input
              type="text"
              required
              value={formData.numeroFacture}
              onChange={(e) => setFormData({ ...formData, numeroFacture: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-2">Entreprise</label>
            <select
              required
              value={formData.entreprise}
              onChange={(e) => handleEntrepriseChange(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Payé" | "Non payé" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              >
                <option value="Payé">Payé</option>
                <option value="Non payé">Non payé</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Date</label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-2">Prix (€)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: parseInt(e.target.value) || 0 })}
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
              {facture ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
