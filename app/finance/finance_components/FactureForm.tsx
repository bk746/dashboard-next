"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import type { AbonnementOffre, Client, Devis, Facture, PrestationDevis } from "@/app/types";
import { ABONNEMENT_OPTIONS, normalizeAbonnement } from "@/lib/abonnement";
import { nextNumeroFacture, isNumeroFactureDuplique } from "@/lib/factureNumber";
import { useCompany } from "@/app/hooks/useCompany";
import { parseDateFr } from "@/app/finance/utils";
import { overlayBackdropClass, overlayScrollBodyClass, secondaryButtonClass } from "@/app/components/appCardStyles";
import {
  financeLightPanelWide,
  financeLightInput,
  financeLightLabel,
  financeVioletPrimaryBtn,
} from "@/app/finance/financeUi";

interface FactureFormProps {
  facture?: Facture | null;
  fromDevis?: Devis | null;
  clients: Client[];
  /** Toutes les factures — numérotation séquentielle et détection de doublons. */
  factures: Facture[];
  onClose: () => void;
  onSave: (facture: Facture) => void;
}

const defaultPrestation = (): PrestationDevis => ({ designation: "", prix: 0 });

function addDaysFr(dateFr: string, days: number): string {
  const d = parseDateFr(dateFr) ?? new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR");
}

export default function FactureForm({
  facture,
  fromDevis,
  clients,
  factures,
  onClose,
  onSave,
}: FactureFormProps) {
  const [company] = useCompany();
  const [numeroFacture, setNumeroFacture] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [statut, setStatut] = useState<Facture["statut"]>("Non payé");
  const [date, setDate] = useState(new Date().toLocaleDateString("fr-FR"));
  const [dateEcheance, setDateEcheance] = useState("");
  const [abonnement, setAbonnement] = useState<AbonnementOffre>("Aucun");
  const [prestations, setPrestations] = useState<PrestationDevis[]>([defaultPrestation()]);
  const [hasAcompte, setHasAcompte] = useState(false);
  const [montantAcompte, setMontantAcompte] = useState(0);
  const [numeroError, setNumeroError] = useState<string | null>(null);

  useEffect(() => {
    if (facture) {
      setNumeroFacture(facture.numeroFacture);
      setEntreprise(facture.entreprise);
      setStatut(facture.statut);
      setDate(facture.date);
      setDateEcheance(facture.dateEcheance ?? "");
      setAbonnement(normalizeAbonnement(facture.abonnement));
      setPrestations(
        facture.prestations && facture.prestations.length > 0
          ? facture.prestations
          : [{ designation: "Prestation / Abonnement", prix: facture.prix }]
      );
      const ac = facture.statut === "Payé" ? 0 : (facture.montantAcompte ?? 0);
      setHasAcompte(ac > 0);
      setMontantAcompte(ac);
      return;
    }

    const today = new Date().toLocaleDateString("fr-FR");
    const delai = Math.max(0, Math.round(company.delaiPaiementJours ?? 30));
    setNumeroFacture(nextNumeroFacture(factures));
    setStatut("Non payé");
    setDate(today);
    setDateEcheance(addDaysFr(today, delai));
    setHasAcompte(false);
    setMontantAcompte(0);

    if (fromDevis) {
      setEntreprise(fromDevis.entreprise);
      setAbonnement(normalizeAbonnement(fromDevis.abonnement));
      setPrestations(
        fromDevis.prestations && fromDevis.prestations.length > 0
          ? fromDevis.prestations.map((p) => ({ ...p }))
          : [{ designation: "Prestation", prix: fromDevis.prix }]
      );
    } else {
      setEntreprise("");
      setAbonnement("Aucun");
      setPrestations([defaultPrestation()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facture, fromDevis]);

  const total = prestations.reduce((s, p) => s + (p.inclusForfait ? 0 : p.prix), 0);

  const montantAcompteEffectif =
    statut === "Payé" || !hasAcompte ? 0 : Math.max(0, Math.min(total, Math.round(montantAcompte)));
  const resteAPayer = statut === "Payé" ? 0 : Math.max(0, total - montantAcompteEffectif);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numero = numeroFacture.trim();
    if (isNumeroFactureDuplique(factures, numero, facture?.id)) {
      setNumeroError(`Le numéro ${numero} existe déjà — chaque facture doit avoir un numéro unique.`);
      return;
    }
    setNumeroError(null);

    const cleaned = prestations.filter((p) => p.designation.trim() !== "" || p.prix > 0);
    if (cleaned.length === 0) return;

    const factureToSave: Facture = {
      id: facture?.id || Date.now().toString(),
      numeroFacture: numero,
      entreprise,
      statut,
      date,
      prix: cleaned.reduce((s, p) => s + (p.inclusForfait ? 0 : p.prix), 0),
      abonnement,
      prestations: cleaned,
      dateEcheance: dateEcheance.trim() || undefined,
      devisId: facture?.devisId ?? fromDevis?.id,
      montantAcompte: montantAcompteEffectif > 0 ? montantAcompteEffectif : undefined,
    };
    onSave(factureToSave);
    onClose();
  };

  const handleEntrepriseChange = (val: string) => {
    setEntreprise(val);
    const client = clients.find((c) => c.entreprise === val);
    setAbonnement(normalizeAbonnement(client?.abonnement));
  };

  const addPrestation = () => setPrestations((prev) => [...prev, defaultPrestation()]);
  const removePrestation = (index: number) => {
    if (prestations.length <= 1) return;
    setPrestations((prev) => prev.filter((_, i) => i !== index));
  };
  const updatePrestation = (index: number, field: "designation" | "prix", value: string | number) => {
    setPrestations((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const title = facture
    ? "Modifier la facture"
    : fromDevis
      ? `Facture à partir du devis ${fromDevis.numeroDevis}`
      : "Nouvelle facture";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={financeLightPanelWide}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facture-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="facture-form-title" className="text-lg font-semibold tracking-tight text-zinc-900 pr-2">
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
              <label className={financeLightLabel}>Numéro de facture</label>
              <input
                type="text"
                required
                readOnly={!facture}
                value={numeroFacture}
                onChange={(e) => {
                  setNumeroFacture(e.target.value);
                  setNumeroError(null);
                }}
                className={`${financeLightInput} ${!facture ? "cursor-default text-zinc-500" : ""}`}
              />
              {numeroError ? (
                <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                  {numeroError}
                </p>
              ) : !facture ? (
                <p className="mt-1.5 text-xs text-zinc-400">
                  Numérotation séquentielle automatique (obligation fiscale — ne pas modifier).
                </p>
              ) : null}
            </div>

            <div>
              <label className={financeLightLabel}>Entreprise</label>
              <select
                required
                value={entreprise}
                onChange={(e) => handleEntrepriseChange(e.target.value)}
                className={financeLightInput}
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
                <label className={financeLightLabel}>Statut</label>
                <select
                  value={statut}
                  onChange={(e) => {
                    const s = e.target.value as Facture["statut"];
                    setStatut(s);
                    if (s === "Payé") {
                      setHasAcompte(false);
                      setMontantAcompte(0);
                    }
                  }}
                  className={financeLightInput}
                >
                  <option value="Payé">Payé</option>
                  <option value="Non payé">Non payé</option>
                </select>
              </div>
              <div>
                <label className={financeLightLabel}>Abonnement</label>
                <select
                  value={abonnement}
                  onChange={(e) => setAbonnement(e.target.value as AbonnementOffre)}
                  className={financeLightInput}
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
                <label className={financeLightLabel}>Date d&apos;émission</label>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={financeLightInput}
                />
              </div>
              <div>
                <label className={financeLightLabel}>Échéance de paiement</label>
                <input
                  type="text"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={financeLightInput}
                />
                <p className="mt-1.5 text-xs text-zinc-400">
                  Pré-remplie : émission + {Math.max(0, Math.round(company.delaiPaiementJours ?? 30))} jours
                  (modifiable dans Paramètres).
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-600">Prestations facturées</span>
                <button
                  type="button"
                  onClick={addPrestation}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007AFF] transition-opacity hover:opacity-90"
                >
                  <FaPlus /> Ajouter une ligne
                </button>
              </div>
              {fromDevis ? (
                <p className="mb-3 rounded-lg bg-[#007AFF]/[0.08] px-3 py-2 text-xs text-zinc-700">
                  Lignes reprises du devis {fromDevis.numeroDevis} — ajustez si besoin.
                </p>
              ) : null}
              <div className="space-y-3">
                {prestations.map((p, index) => (
                  <div key={index} className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={p.designation}
                      onChange={(e) => updatePrestation(index, "designation", e.target.value)}
                      placeholder="ex. Refonte site vitrine, maintenance mensuelle…"
                      className={`${financeLightInput} flex-1 placeholder:text-zinc-400`}
                    />
                    <div className="flex items-center gap-2">
                      {p.inclusForfait ? (
                        <span className="w-28 text-center text-sm text-zinc-400">Inclus</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={p.prix || ""}
                          onChange={(e) => updatePrestation(index, "prix", Number(e.target.value) || 0)}
                          placeholder="Prix €"
                          className={`${financeLightInput} w-28`}
                        />
                      )}
                      <span className="text-sm text-zinc-500">€</span>
                      <button
                        type="button"
                        onClick={() => removePrestation(index)}
                        disabled={prestations.length <= 1}
                        className="p-2 text-zinc-500 transition-colors hover:text-red-500 disabled:opacity-40"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                Total TTC :{" "}
                <span className="font-semibold tabular-nums text-zinc-900">
                  {total.toLocaleString("fr-FR")} €
                </span>
              </p>
            </div>

            {statut === "Non payé" ? (
              <div className="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#007AFF] focus:ring-[#007AFF]"
                    checked={hasAcompte}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setHasAcompte(on);
                      if (!on) setMontantAcompte(0);
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-800">Acompte versé</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      Cochez si un acompte a déjà été encaissé ; le reste à payer est calculé automatiquement.
                    </span>
                  </span>
                </label>
                {hasAcompte ? (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className={financeLightLabel} htmlFor="facture-acompte">
                        Montant de l&apos;acompte (€)
                      </label>
                      <input
                        id="facture-acompte"
                        type="number"
                        min="0"
                        max={total}
                        value={montantAcompte || ""}
                        onChange={(e) => {
                          const n = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setMontantAcompte(Math.min(total, n));
                        }}
                        className={financeLightInput}
                      />
                    </div>
                    <p className="text-sm font-medium tabular-nums text-zinc-800">
                      Reste à payer :{" "}
                      <span className="text-[#007AFF]">{resteAPayer.toLocaleString("fr-FR")} €</span>
                      <span className="ml-2 font-normal text-zinc-500">
                        (total {total.toLocaleString("fr-FR")} €
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

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={financeVioletPrimaryBtn}>
              {facture ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
