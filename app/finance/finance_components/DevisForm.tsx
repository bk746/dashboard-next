"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import type { Client, Devis, PrestationDevis } from "@/app/types";

interface DevisFormProps {
  devis?: Devis | null;
  clients: Client[];
  onClose: () => void;
  onSave: (devis: Devis) => void;
}

const defaultPrestation = (): PrestationDevis => ({ designation: "", prix: 0 });

export default function DevisForm({ devis, clients, onClose, onSave }: DevisFormProps) {
  const [numeroDevis, setNumeroDevis] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [statut, setStatut] = useState<Devis["statut"]>("Brouillon");
  const [date, setDate] = useState(new Date().toLocaleDateString("fr-FR"));
  const [validite, setValidite] = useState("");
  const [abonnement, setAbonnement] = useState<"Actif" | "Inactif">("Actif");
  const [prestations, setPrestations] = useState<PrestationDevis[]>([defaultPrestation()]);

  useEffect(() => {
    if (devis) {
      setNumeroDevis(devis.numeroDevis);
      setEntreprise(devis.entreprise);
      setStatut(devis.statut);
      setDate(devis.date);
      setValidite(devis.validite ?? "");
      setAbonnement(devis.abonnement);
      if (devis.prestations && devis.prestations.length > 0) {
        setPrestations(devis.prestations);
      } else {
        setPrestations([{ designation: "Prestation", prix: devis.prix }]);
      }
    } else {
      const savedDevis = localStorage.getItem("devis");
      const devisList = savedDevis ? JSON.parse(savedDevis) : [];
      const nextNumero = devisList.length + 1;
      setNumeroDevis(`DEV-${String(nextNumero).padStart(6, "0")}`);
      setPrestations([defaultPrestation()]);
    }
  }, [devis]);

  const total = prestations.reduce((s, p) => s + p.prix, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = prestations.filter((p) => p.designation.trim() !== "" || p.prix > 0);
    if (cleaned.length === 0) return;
    const devisToSave: Devis = {
      id: devis?.id || Date.now().toString(),
      numeroDevis,
      entreprise,
      statut,
      date,
      prix: cleaned.reduce((s, p) => s + p.prix, 0),
      prestations: cleaned,
      validite: validite || undefined,
      abonnement,
    };
    onSave(devisToSave);
    onClose();
  };

  const handleEntrepriseChange = (val: string) => {
    setEntreprise(val);
    const client = clients.find((c) => c.entreprise === val);
    if (client?.abonnement) setAbonnement(client.abonnement as "Actif" | "Inactif");
  };

  const addPrestation = () => setPrestations((prev) => [...prev, defaultPrestation()]);
  const removePrestation = (index: number) => {
    if (prestations.length <= 1) return;
    setPrestations((prev) => prev.filter((_, i) => i !== index));
  };
  const updatePrestation = (index: number, field: "designation" | "prix", value: string | number) => {
    setPrestations((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4">
      <div className="bg-[#f6f6f6] border border-gray-300 rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-gray-500 text-xl font-bold">
            {devis ? "Modifier le devis" : "Nouveau devis"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-600">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-500 text-sm mb-2">Numéro de devis</label>
            <input
              type="text"
              required
              value={numeroDevis}
              onChange={(e) => setNumeroDevis(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-2">Entreprise</label>
            <select
              required
              value={entreprise}
              onChange={(e) => handleEntrepriseChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
            >
              <option value="">Sélectionner une entreprise</option>
              {clients.map((c) => (
                <option key={c.id} value={c.entreprise}>{c.entreprise}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as Devis["statut"])}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Envoyé">Envoyé</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-2">Abonnement</label>
              <select
                value={abonnement}
                onChange={(e) => setAbonnement(e.target.value as "Actif" | "Inactif")}
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-2">Validité (optionnel)</label>
              <input
                type="text"
                value={validite}
                onChange={(e) => setValidite(e.target.value)}
                placeholder="ex. 30 jours"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-500 text-sm">Prestations</label>
              <button
                type="button"
                onClick={addPrestation}
                className="inline-flex items-center gap-1.5 text-sm text-[#ED8600] hover:opacity-90"
              >
                <FaPlus /> Ajouter une prestation
              </button>
            </div>
            <div className="space-y-3">
              {prestations.map((p, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={p.designation}
                    onChange={(e) => updatePrestation(index, "designation", e.target.value)}
                    placeholder="ex. Refonte site vitrine, Site e-commerce..."
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600] placeholder-gray-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={p.prix || ""}
                      onChange={(e) => updatePrestation(index, "prix", Number(e.target.value) || 0)}
                      placeholder="Prix €"
                      className="w-28 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 focus:outline-none focus:border-[#ED8600]"
                    />
                    <span className="text-gray-500 text-sm">€</span>
                    <button
                      type="button"
                      onClick={() => removePrestation(index)}
                      disabled={prestations.length <= 1}
                      className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-40"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Total : <span className="text-gray-500 font-semibold">{total.toLocaleString("fr-FR")} €</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-200 w-full sm:w-auto">
              Annuler
            </button>
            <button type="submit" className="px-6 py-2 bg-[#ED8600] rounded-lg text-white hover:opacity-90 w-full sm:w-auto">
              {devis ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
