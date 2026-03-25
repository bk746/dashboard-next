"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client, Facture, Projet } from "@/app/types";
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
        className={overlayPanelClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projet-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="projet-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Nom facture</label>
              <select
                value={selectedFactureId}
                onChange={(e) => handleFactureChange(e.target.value)}
                className={inputFieldClass}
              >
                <option value="">Aucune (remplir manuellement)</option>
                {factures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numeroFacture} – {f.entreprise} – {f.prix.toLocaleString("fr-FR")} €
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Choisir une facture remplit automatiquement le nom, l&apos;entreprise et la valeur.
              </p>
            </div>

            <div>
              <label className={formLabelClass}>Nom du projet</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={inputFieldClass}
              />
            </div>

            <div>
              <label className={formLabelClass}>Entreprise</label>
              <select
                required
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
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

            <div>
              <label className={formLabelClass}>Statut</label>
              <select
                value={formData.statut}
                onChange={(e) =>
                  setFormData({ ...formData, statut: e.target.value as "Actif" | "Prospect" | "Terminé" })
                }
                className={inputFieldClass}
              >
                <option value="Actif">Actif</option>
                <option value="Prospect">Prospect</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Valeur (€)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: parseInt(e.target.value, 10) || 0 })}
                  className={inputFieldClass}
                />
              </div>

              <div>
                <label className={formLabelClass}>Responsable</label>
                <input
                  type="text"
                  required
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Date de début</label>
                <input
                  type="text"
                  required
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={inputFieldClass}
                />
              </div>

              <div>
                <label className={formLabelClass}>Date de fin</label>
                <input
                  type="text"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={inputFieldClass}
                />
              </div>
            </div>

            <div>
              <label className={formLabelClass}>Commentaire</label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Décrivez le projet..."
                rows={4}
                className={`${inputFieldClass} resize-none`}
              />
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {projet ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
