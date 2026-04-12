"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { AbonnementOffre, Client, Devis, Facture } from "@/app/types";
import { ABONNEMENT_OPTIONS, normalizeAbonnement } from "@/lib/abonnement";
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
  const [hasAcompte, setHasAcompte] = useState(false);
  const [formData, setFormData] = useState<Omit<Facture, "id">>({
    numeroFacture: "",
    entreprise: "",
    statut: "Non payé",
    date: new Date().toLocaleDateString("fr-FR"),
    prix: 0,
    abonnement: "Aucun",
    montantAcompte: 0,
  });

  useEffect(() => {
    if (facture) {
      const ac = facture.statut === "Payé" ? 0 : (facture.montantAcompte ?? 0);
      setHasAcompte(ac > 0);
      setFormData({
        numeroFacture: facture.numeroFacture,
        entreprise: facture.entreprise,
        statut: facture.statut,
        date: facture.date,
        prix: facture.prix,
        abonnement: normalizeAbonnement(facture.abonnement),
        montantAcompte: ac,
      });
    } else if (fromDevis) {
      const savedFactures = localStorage.getItem("factures");
      const factures = savedFactures ? JSON.parse(savedFactures) : [];
      const nextNumero = factures.length + 1;
      setHasAcompte(false);
      setFormData({
        numeroFacture: `FAC-${String(nextNumero).padStart(6, "0")}`,
        entreprise: fromDevis.entreprise,
        statut: "Non payé",
        date: new Date().toLocaleDateString("fr-FR"),
        prix: fromDevis.prix,
        abonnement: normalizeAbonnement(fromDevis.abonnement),
        montantAcompte: 0,
      });
    } else {
      const savedFactures = localStorage.getItem("factures");
      const factures = savedFactures ? JSON.parse(savedFactures) : [];
      const nextNumero = factures.length + 1;
      setHasAcompte(false);
      setFormData((prev) => ({
        ...prev,
        numeroFacture: `FAC-${String(nextNumero).padStart(6, "0")}`,
        montantAcompte: 0,
      }));
    }
  }, [facture, fromDevis]);

  const montantAcompteEffectif =
    formData.statut === "Payé" || !hasAcompte
      ? 0
      : Math.max(0, Math.min(formData.prix, Math.round(formData.montantAcompte ?? 0)));
  const resteAPayer = formData.statut === "Payé" ? 0 : Math.max(0, formData.prix - montantAcompteEffectif);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ac =
      formData.statut === "Payé" || !hasAcompte
        ? 0
        : Math.max(0, Math.min(formData.prix, Math.round(formData.montantAcompte ?? 0)));
    const factureToSave: Facture = {
      ...formData,
      montantAcompte: ac > 0 ? ac : undefined,
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
      abonnement: normalizeAbonnement(client?.abonnement),
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
                  onChange={(e) => {
                    const statut = e.target.value as "Payé" | "Non payé";
                    setFormData({
                      ...formData,
                      statut,
                      montantAcompte: statut === "Payé" ? 0 : formData.montantAcompte,
                    });
                    if (statut === "Payé") setHasAcompte(false);
                  }}
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
                  onChange={(e) =>
                    setFormData({ ...formData, abonnement: e.target.value as AbonnementOffre })
                  }
                  className={inputFieldClass}
                >
                  {ABONNEMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
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
                  onChange={(e) => {
                    const prix = parseInt(e.target.value, 10) || 0;
                    const ac = Math.round(formData.montantAcompte ?? 0);
                    setFormData({
                      ...formData,
                      prix,
                      montantAcompte: hasAcompte ? Math.min(prix, ac) : 0,
                    });
                  }}
                  className={inputFieldClass}
                />
              </div>
            </div>

            {formData.statut === "Non payé" ? (
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#ED8600] focus:ring-[#ED8600] dark:border-zinc-600 dark:bg-zinc-900 dark:focus:ring-[#5b7fb8]"
                    checked={hasAcompte}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setHasAcompte(on);
                      if (!on) {
                        setFormData({ ...formData, montantAcompte: 0 });
                      }
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">Acompte versé</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Cochez si un acompte a déjà été encaissé ; le reste à payer est calculé automatiquement.
                    </span>
                  </span>
                </label>
                {hasAcompte ? (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className={formLabelClass} htmlFor="facture-acompte">
                        Montant de l&apos;acompte (€)
                      </label>
                      <input
                        id="facture-acompte"
                        type="number"
                        min="0"
                        max={formData.prix}
                        value={formData.montantAcompte ?? 0}
                        onChange={(e) => {
                          const n = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setFormData({
                            ...formData,
                            montantAcompte: Math.min(formData.prix, n),
                          });
                        }}
                        className={inputFieldClass}
                      />
                    </div>
                    <p className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-100">
                      Reste à payer :{" "}
                      <span className="text-[#ED8600] dark:text-[#8fa9c9]">{resteAPayer.toLocaleString("fr-FR")} €</span>
                      <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                        (total {formData.prix.toLocaleString("fr-FR")} €
                        {montantAcompteEffectif > 0
                          ? ` − acompte ${montantAcompteEffectif.toLocaleString("fr-FR")} €`
                          : ""}
                        )
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
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
