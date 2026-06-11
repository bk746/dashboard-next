"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client, Facture, Projet } from "@/app/types";
import { overlayBackdropClass, overlayScrollBodyClass } from "@/app/components/appCardStyles";
import {
  dealsLightPanel,
  dealsLightInput,
  dealsLightLabel,
  dealsSecondaryBtn,
  dealsVioletPrimaryBtn,
} from "@/app/deals-projets/dealsProjetsUi";

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

  const title = projet ? "Modifier le projet" : "Nouveau projet";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={dealsLightPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projet-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="projet-form-title" className="text-lg font-semibold tracking-tight text-zinc-900 pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fermer"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={dealsLightLabel}>Nom facture</label>
              <select
                value={selectedFactureId}
                onChange={(e) => handleFactureChange(e.target.value)}
                className={dealsLightInput}
              >
                <option value="">Aucune (remplir manuellement)</option>
                {factures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numeroFacture} – {f.entreprise} – {f.prix.toLocaleString("fr-FR")} €
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                Choisir une facture remplit le nom, l&apos;entreprise et la valeur.
              </p>
            </div>

            <div>
              <label className={dealsLightLabel}>Nom du projet</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={dealsLightInput}
              />
            </div>

            <div>
              <label className={dealsLightLabel}>Entreprise</label>
              <select
                required
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                className={dealsLightInput}
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
              <label className={dealsLightLabel}>Statut</label>
              <select
                value={formData.statut}
                onChange={(e) =>
                  setFormData({ ...formData, statut: e.target.value as "Actif" | "Prospect" | "Terminé" })
                }
                className={dealsLightInput}
              >
                <option value="Actif">Actif</option>
                <option value="Prospect">Prospect</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={dealsLightLabel}>Valeur (€)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: parseInt(e.target.value, 10) || 0 })}
                  className={dealsLightInput}
                />
              </div>

              <div>
                <label className={dealsLightLabel}>Responsable</label>
                <input
                  type="text"
                  required
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  className={dealsLightInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={dealsLightLabel}>Date de début</label>
                <input
                  type="text"
                  required
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={dealsLightInput}
                />
              </div>

              <div>
                <label className={dealsLightLabel}>Date de fin</label>
                <input
                  type="text"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={dealsLightInput}
                />
              </div>
            </div>

            <div>
              <label className={dealsLightLabel}>Commentaire</label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Décrivez le projet..."
                rows={4}
                className={`${dealsLightInput} resize-none`}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <button type="button" onClick={onClose} className={dealsSecondaryBtn}>
              Annuler
            </button>
            <button type="submit" className={dealsVioletPrimaryBtn}>
              {projet ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
