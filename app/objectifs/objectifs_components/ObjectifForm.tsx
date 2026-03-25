"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
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

interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
}

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
  });

  useEffect(() => {
    if (objectif) {
      setFormData({
        type: objectif.type,
        libelle: objectif.libelle,
        objectif: objectif.objectif,
        dateDebut: objectif.dateDebut,
        dateFin: objectif.dateFin,
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
        className={overlayPanelClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="objectif-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="objectif-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Libellé</label>
              <input
                type="text"
                required
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                placeholder="Ex: Objectif 200 000€"
                className={inputFieldClass}
              />
            </div>

            <div>
              <label className={formLabelClass}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "Financier" | "Client" })}
                className={inputFieldClass}
              >
                <option value="Financier">Financier</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div>
              <label className={formLabelClass}>Objectif {formData.type === "Financier" ? "(€)" : ""}</label>
              <input
                type="number"
                required
                min="0"
                value={formData.objectif}
                onChange={(e) => setFormData({ ...formData, objectif: parseInt(e.target.value, 10) || 0 })}
                placeholder={formData.type === "Financier" ? "Ex: 200000" : "Ex: 100"}
                className={inputFieldClass}
              />
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
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {objectif ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
