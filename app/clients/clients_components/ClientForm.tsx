"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { Client } from "@/app/types";
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

  const title = client ? "Modifier le client" : "Nouveau client";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayPanelClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="client-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Nom de l&apos;entreprise</label>
              <input
                type="text"
                required
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                className={inputFieldClass}
              />
            </div>

            <div>
              <label className={formLabelClass}>Nom du patron</label>
              <input
                type="text"
                required
                value={formData.patron}
                onChange={(e) => setFormData({ ...formData, patron: e.target.value })}
                className={inputFieldClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Téléphone</label>
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className={inputFieldClass}
                />
              </div>

              <div>
                <label className={formLabelClass}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={formLabelClass}>Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) =>
                    setFormData({ ...formData, statut: e.target.value as "Actif" | "Inactif" | "Prospect" })
                  }
                  className={inputFieldClass}
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>

              <div>
                <label className={formLabelClass}>Abonnement</label>
                <select
                  value={formData.abonnement}
                  onChange={(e) =>
                    setFormData({ ...formData, abonnement: e.target.value as "Actif" | "Inactif" })
                  }
                  className={inputFieldClass}
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div>
              <label className={formLabelClass}>Secteur d&apos;activité</label>
              <input
                type="text"
                value={formData.secteurActivite}
                onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                placeholder="Ex. Tech, Santé, BTP..."
                className={inputFieldClass}
              />
            </div>

            <div>
              <label className={formLabelClass}>Dernière activité</label>
              <input
                type="text"
                required
                value={formData.derniereActivite}
                onChange={(e) => setFormData({ ...formData, derniereActivite: e.target.value })}
                placeholder="DD/MM/YYYY"
                className={inputFieldClass}
              />
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {client ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
