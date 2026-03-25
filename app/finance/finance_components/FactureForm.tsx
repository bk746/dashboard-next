"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client, Devis, Facture } from "@/app/types";
import {
  overlayBackdropClass,
  overlayPanelClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
  inputFieldClass,
  formLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/app/components/appCardStyles";

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
    const client = clients.find((c) => c.entreprise === entreprise);
    setFormData({
      ...formData,
      entreprise,
      abonnement: client?.abonnement || "Actif",
    });
  };

  const title = facture
    ? "Modifier la facture"
    : fromDevis
      ? `Facture à partir du devis ${fromDevis.numeroDevis}`
      : "Nouvelle facture";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayPanelClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facture-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="facture-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Numéro de facture</label>
              <input
                type="text"
                required
                value={formData.numeroFacture}
                onChange={(e) => setFormData({ ...formData, numeroFacture: e.target.value })}
                className={inputFieldClass}
              />
            </div>

            <div>
              <label className={formLabelClass}>Entreprise</label>
              <select
                required
                value={formData.entreprise}
                onChange={(e) => handleEntrepriseChange(e.target.value)}
                className={inputFieldClass}
              >
                <option value="">Sélectionner une entreprise</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.entreprise}>
                    {client.entreprise}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as "Payé" | "Non payé" })}
                  className={inputFieldClass}
                >
                  <option value="Payé">Payé</option>
                  <option value="Non payé">Non payé</option>
                </select>
              </div>

              <div>
                <label className={formLabelClass}>Abonnement</label>
                <select
                  value={formData.abonnement}
                  onChange={(e) => setFormData({ ...formData, abonnement: e.target.value as "Actif" | "Inactif" })}
                  className={inputFieldClass}
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Date</label>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={inputFieldClass}
                />
              </div>

              <div>
                <label className={formLabelClass}>Prix (€)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: parseInt(e.target.value, 10) || 0 })}
                  className={inputFieldClass}
                />
              </div>
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {facture ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
