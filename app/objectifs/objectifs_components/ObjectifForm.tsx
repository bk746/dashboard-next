"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { overlayBackdropClass, overlayScrollBodyClass } from "@/app/components/appCardStyles";
import type { Objectif, ObjectifPeriode } from "@/app/types";
import {
  objectifsLightPanel,
  objectifsLightInput,
  objectifsLightLabel,
  objectifsSecondaryBtn,
  objectifsVioletPrimaryBtn,
} from "@/app/objectifs/objectifsUi";

interface ObjectifFormProps {
  objectif?: Objectif | null;
  onClose: () => void;
  onSave: (objectif: Objectif) => void;
}

export default function ObjectifForm({ objectif, onClose, onSave }: ObjectifFormProps) {
  const [formData, setFormData] = useState<Omit<Objectif, "id">>({
    type: "Financier",
    libelle: "",
    objectif: 0,
    dateDebut: new Date().toLocaleDateString("fr-FR"),
    dateFin: "",
    periode: "annee",
  });

  useEffect(() => {
    if (objectif) {
      setFormData({
        type: objectif.type,
        libelle: objectif.libelle,
        objectif: objectif.objectif,
        dateDebut: objectif.dateDebut,
        dateFin: objectif.dateFin,
        periode: objectif.periode ?? "annee",
      });
    }
  }, [objectif]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const objectifToSave: Objectif = {
      ...formData,
      id: objectif?.id || Date.now().toString(),
    };
    onSave(objectifToSave);
    onClose();
  };

  const title = objectif ? "Modifier l'objectif" : "Nouvel objectif";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={objectifsLightPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="objectif-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="objectif-form-title" className="text-lg font-semibold text-zinc-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Fermer"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={`${overlayScrollBodyClass} space-y-4`}>
            <div>
              <label className={objectifsLightLabel}>Libellé</label>
              <input
                type="text"
                required
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                placeholder="Ex: Objectif 200 000€"
                className={objectifsLightInput}
              />
            </div>

            <div>
              <label className={objectifsLightLabel}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "Financier" | "Client" })}
                className={objectifsLightInput}
              >
                <option value="Financier">Financier</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div>
              <label className={objectifsLightLabel}>Période de suivi</label>
              <select
                value={formData.periode ?? "annee"}
                onChange={(e) => setFormData({ ...formData, periode: e.target.value as ObjectifPeriode })}
                className={objectifsLightInput}
              >
                <option value="annee">Année civile en cours</option>
                <option value="mois">Mois en cours</option>
                <option value="semaine">Semaine en cours (lun.–dim.)</option>
              </select>
              <p className="mt-1.5 text-xs text-zinc-500">
                Le réalisé est calculé sur cette fenêtre (CA encaissé ou volume clients selon le type).
              </p>
            </div>

            <div>
              <label className={objectifsLightLabel}>Objectif {formData.type === "Financier" ? "(€)" : ""}</label>
              <input
                type="number"
                required
                min="0"
                value={formData.objectif}
                onChange={(e) => setFormData({ ...formData, objectif: parseInt(e.target.value, 10) || 0 })}
                placeholder={formData.type === "Financier" ? "Ex: 200000" : "Ex: 100"}
                className={objectifsLightInput}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={objectifsLightLabel}>Date de début</label>
                <input
                  type="text"
                  required
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={objectifsLightInput}
                />
              </div>
              <div>
                <label className={objectifsLightLabel}>Date de fin</label>
                <input
                  type="text"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={objectifsLightInput}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
            <button type="button" onClick={onClose} className={objectifsSecondaryBtn}>
              Annuler
            </button>
            <button type="submit" className={objectifsVioletPrimaryBtn}>
              {objectif ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
