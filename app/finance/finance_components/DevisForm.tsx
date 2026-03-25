"use client";

import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import type { AbonnementOffre, Client, Devis, PrestationDevis } from "@/app/types";
import { ABONNEMENT_OPTIONS, normalizeAbonnement } from "@/lib/abonnement";
import { generateDevisNumero } from "@/lib/devisNumber";
import {
  buildPrestationsFromEstimation,
  getLatestEstimationForClient,
} from "@/app/estimation/estimation_utils";
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

interface DevisFormProps {
  devis?: Devis | null;
  clients: Client[];
  onClose: () => void;
  onSave: (devis: Devis) => void;
  /** Après enregistrement, ouvre le formulaire facture prérempli (bouton « Créer une facture à partir du devis », statut Accepté requis) */
  onCreateFacture?: (devis: Devis) => void;
}

const defaultPrestation = (): PrestationDevis => ({ designation: "", prix: 0 });

export default function DevisForm({ devis, clients, onClose, onSave, onCreateFacture }: DevisFormProps) {
  const [numeroDevis, setNumeroDevis] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [statut, setStatut] = useState<Devis["statut"]>("Brouillon");
  const [date, setDate] = useState(new Date().toLocaleDateString("fr-FR"));
  const [validitePreset, setValiditePreset] = useState<"15j" | "30j" | "custom">("15j");
  const [validiteCustom, setValiditeCustom] = useState("");
  const [abonnement, setAbonnement] = useState<AbonnementOffre>("Essentiel");
  const [prestations, setPrestations] = useState<PrestationDevis[]>([defaultPrestation()]);
  const [estimationHint, setEstimationHint] = useState<string | null>(null);

  const applyEstimationForClient = useCallback(
    (entrepriseName: string) => {
      if (devis) return;
      const client = clients.find((c) => c.entreprise === entrepriseName);
      if (!client) {
        setEstimationHint(null);
        return;
      }
      const est = getLatestEstimationForClient(client.id);
      if (!est) {
        setPrestations([defaultPrestation()]);
        setEstimationHint(
          "Aucune estimation enregistrée pour ce client — saisissez les prestations manuellement ou créez une estimation dans Finance → Estimation."
        );
        return;
      }
      const list = buildPrestationsFromEstimation(est);
      if (list.length === 0) {
        setPrestations([defaultPrestation()]);
        setEstimationHint(
          "Une estimation existe mais aucune ligne n'est cochée — complétez l'estimateur ou saisissez les prestations à la main."
        );
        return;
      }
      setPrestations(list);
      const d = new Date(est.updatedAt).toLocaleDateString("fr-FR");
      const lib = est.libelle ? ` « ${est.libelle} »` : "";
      setEstimationHint(`Prestations importées depuis la dernière estimation du ${d}${lib}.`);
    },
    [clients, devis]
  );

  useEffect(() => {
    if (devis) {
      setNumeroDevis(devis.numeroDevis);
      setEntreprise(devis.entreprise);
      setStatut(devis.statut);
      setDate(devis.date);
      {
        const v = devis.validite ?? "";
        if (v === "15 jours") {
          setValiditePreset("15j");
          setValiditeCustom("");
        } else if (v === "30 jours") {
          setValiditePreset("30j");
          setValiditeCustom("");
        } else if (v.trim()) {
          setValiditePreset("custom");
          setValiditeCustom(v);
        } else {
          setValiditePreset("15j");
          setValiditeCustom("");
        }
      }
      setAbonnement(normalizeAbonnement(devis.abonnement));
      setEstimationHint(null);
      if (devis.prestations && devis.prestations.length > 0) {
        setPrestations(devis.prestations);
      } else {
        setPrestations([{ designation: "Prestation", prix: devis.prix }]);
      }
    } else {
      const savedDevis = localStorage.getItem("devis");
      const devisList: Devis[] = savedDevis ? JSON.parse(savedDevis) : [];
      const nums = devisList.map((d) => d.numeroDevis);
      setNumeroDevis(generateDevisNumero(nums));
      setValiditePreset("15j");
      setValiditeCustom("");
      setAbonnement("Essentiel");
      setPrestations([defaultPrestation()]);
      setEstimationHint(null);
    }
  }, [devis]);

  const total = prestations.reduce((s, p) => s + p.prix, 0);

  const resolvedValidite = (): string | undefined => {
    if (validitePreset === "15j") return "15 jours";
    if (validitePreset === "30j") return "30 jours";
    const t = validiteCustom.trim();
    return t || undefined;
  };

  const buildDevisToSave = (): Devis | null => {
    const cleaned = prestations.filter((p) => p.designation.trim() !== "" || p.prix > 0);
    if (cleaned.length === 0) return null;
    return {
      id: devis?.id || Date.now().toString(),
      numeroDevis,
      entreprise,
      statut,
      date,
      prix: cleaned.reduce((s, p) => s + p.prix, 0),
      prestations: cleaned,
      validite: resolvedValidite(),
      abonnement,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const devisToSave = buildDevisToSave();
    if (!devisToSave) return;
    onSave(devisToSave);
    onClose();
  };

  const handleSaveAndCreateFacture = () => {
    if (statut !== "Accepté" || !onCreateFacture) return;
    const devisToSave = buildDevisToSave();
    if (!devisToSave) return;
    onSave(devisToSave);
    onCreateFacture(devisToSave);
    onClose();
  };

  const handleEntrepriseChange = (val: string) => {
    setEntreprise(val);
    const client = clients.find((c) => c.entreprise === val);
    setAbonnement(normalizeAbonnement(client?.abonnement));
    applyEstimationForClient(val);
  };

  const addPrestation = () => setPrestations((prev) => [...prev, defaultPrestation()]);
  const removePrestation = (index: number) => {
    if (prestations.length <= 1) return;
    setPrestations((prev) => prev.filter((_, i) => i !== index));
  };
  const updatePrestation = (index: number, field: "designation" | "prix", value: string | number) => {
    setPrestations((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const title = devis ? "Modifier le devis" : "Nouveau devis";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayPanelClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="devis-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="devis-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div>
              <label className={formLabelClass}>Numéro de devis</label>
              <input
                type="text"
                required
                value={numeroDevis}
                onChange={(e) => setNumeroDevis(e.target.value)}
                className={inputFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>Entreprise</label>
              <select
                required
                value={entreprise}
                onChange={(e) => handleEntrepriseChange(e.target.value)}
                className={inputFieldClass}
              >
                <option value="">Sélectionner une entreprise</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.entreprise}>
                    {c.entreprise}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={formLabelClass}>Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as Devis["statut"])}
                  className={inputFieldClass}
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Envoyé">Envoyé</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
                {onCreateFacture ? (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Une facture ne peut être générée qu&apos;à partir d&apos;un devis au statut « Accepté ».
                  </p>
                ) : null}
              </div>
              <div>
                <label className={formLabelClass}>Abonnement</label>
                <select
                  value={abonnement}
                  onChange={(e) => setAbonnement(e.target.value as AbonnementOffre)}
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Validité</label>
                <select
                  value={validitePreset}
                  onChange={(e) => {
                    const v = e.target.value as "15j" | "30j" | "custom";
                    setValiditePreset(v);
                    if (v !== "custom") setValiditeCustom("");
                  }}
                  className={`${inputFieldClass} mb-2`}
                >
                  <option value="15j">15 jours</option>
                  <option value="30j">30 jours</option>
                  <option value="custom">Personnalisé</option>
                </select>
                {validitePreset === "custom" ? (
                  <input
                    type="text"
                    value={validiteCustom}
                    onChange={(e) => setValiditeCustom(e.target.value)}
                    placeholder="ex. 45 jours, 2 mois…"
                    className={inputFieldClass}
                  />
                ) : null}
              </div>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Prestations</span>
                <div className="flex flex-wrap items-center gap-3">
                  {!devis && entreprise ? (
                    <button
                      type="button"
                      onClick={() => applyEstimationForClient(entreprise)}
                      className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
                    >
                      Réimporter depuis l&apos;estimation
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={addPrestation}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ED8600] transition-opacity hover:opacity-90 dark:text-[#8fa9c9]"
                  >
                    <FaPlus /> Ajouter une prestation
                  </button>
                </div>
              </div>
              {!devis && estimationHint && (
                <p className="mb-3 rounded-lg border border-[#ED8600]/20 bg-[#ED8600]/5 px-3 py-2 text-xs text-zinc-700 dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-zinc-300">
                  {estimationHint}
                </p>
              )}
              <div className="space-y-3">
                {prestations.map((p, index) => (
                  <div key={index} className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={p.designation}
                      onChange={(e) => updatePrestation(index, "designation", e.target.value)}
                      placeholder="ex. Refonte site vitrine, Site e-commerce..."
                      className={`${inputFieldClass} flex-1 placeholder:text-zinc-400`}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={p.prix || ""}
                        onChange={(e) => updatePrestation(index, "prix", Number(e.target.value) || 0)}
                        placeholder="Prix €"
                        className={`${inputFieldClass} w-28`}
                      />
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
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Total : <span className="font-semibold tabular-nums">{total.toLocaleString("fr-FR")} €</span>
              </p>
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            {onCreateFacture ? (
              <button
                type="button"
                onClick={handleSaveAndCreateFacture}
                disabled={statut !== "Accepté"}
                title={statut !== "Accepté" ? "Passez le statut à « Accepté » pour créer une facture" : undefined}
                className={`${secondaryButtonClass} w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Créer une facture à partir du devis
              </button>
            ) : null}
            <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
              {devis ? "Enregistrer" : "Créer le devis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
