"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import type { AbonnementOffre, Client, Prospect } from "@/app/types";
import { ABONNEMENT_OPTIONS, normalizeAbonnement } from "@/lib/abonnement";
import {
  SECTEURS_ACTIVITE_OPTIONS,
  SECTEUR_ACTIVITE_AUTRE,
  SECTEUR_ACTIVITE_VIDE,
  isSecteurActiviteInList,
} from "@/lib/secteursActivite";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import { overlayBackdropClass, overlayScrollBodyClass, overlayPanelClass, overlayFooterClass, secondaryButtonClass } from "@/app/components/appCardStyles";

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

function defaultNewClientForm() {
  return {
    entreprise: "",
    patron: "",
    telephone: "",
    email: "",
    statut: "Actif" as const,
    abonnement: "Aucun" as AbonnementOffre,
    secteurActivite: "",
    derniereActivite: new Date().toLocaleDateString("fr-FR"),
  };
}

function prospectToFormFields(p: Prospect) {
  return {
    entreprise: p.entreprise.trim(),
    patron: p.contactNom?.trim() ?? "",
    telephone: p.telephone?.trim() ?? "",
    email: p.email?.trim() ?? "",
    statut: "Actif" as const,
    abonnement: "Aucun" as AbonnementOffre,
    secteurActivite: "",
    derniereActivite: new Date().toLocaleDateString("fr-FR"),
  };
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const [prospects] = useJsonBucket<Prospect[]>("prospection", []);
  const prospectsSorted = useMemo(
    () => [...prospects].sort((a, b) => a.entreprise.localeCompare(b.entreprise, "fr")),
    [prospects]
  );

  const [importFromProspection, setImportFromProspection] = useState(false);
  const [importProspectId, setImportProspectId] = useState("");
  const [prospectSearchQuery, setProspectSearchQuery] = useState("");

  const filteredProspectsForImport = useMemo(() => {
    const q = prospectSearchQuery.trim().toLowerCase();
    let list = q
      ? prospectsSorted.filter((p) => {
          const blob = [p.entreprise, p.contactNom ?? "", p.email ?? "", p.telephone ?? ""]
            .join(" ")
            .toLowerCase();
          return blob.includes(q);
        })
      : prospectsSorted;
    if (importProspectId) {
      const selected = prospects.find((x) => x.id === importProspectId);
      if (selected && !list.some((x) => x.id === importProspectId)) {
        list = [selected, ...list];
      }
    }
    return list;
  }, [prospectsSorted, prospectSearchQuery, importProspectId, prospects]);

  const [formData, setFormData] = useState<{
    entreprise: string;
    patron: string;
    telephone: string;
    email: string;
    statut: "Actif" | "Inactif" | "Prospect";
    abonnement: AbonnementOffre;
    secteurActivite: string;
    derniereActivite: string;
  }>(() => defaultNewClientForm());

  useEffect(() => {
    setImportFromProspection(false);
    setImportProspectId("");
    setProspectSearchQuery("");
    if (client) {
      setFormData({
        entreprise: client.entreprise,
        patron: client.patron,
        telephone: client.telephone,
        email: client.email,
        statut: client.statut,
        abonnement: normalizeAbonnement(client.abonnement),
        secteurActivite: client.secteurActivite ?? "",
        derniereActivite: client.derniereActivite,
      });
    } else {
      setFormData(defaultNewClientForm());
    }
  }, [client]);

  const secteurSelectValue = useMemo(() => {
    const v = formData.secteurActivite.trim();
    if (!v) return SECTEUR_ACTIVITE_VIDE;
    if (isSecteurActiviteInList(v)) return v;
    return SECTEUR_ACTIVITE_AUTRE;
  }, [formData.secteurActivite]);

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

  const lightInputClass =
    "w-full rounded-xl border-0 bg-zinc-100/80 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35";
  const lightLabelClass = "block text-[13px] font-medium text-zinc-500 mb-1.5";
  const violetPrimaryBtn =
    "px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-[#007AFF] transition-colors hover:bg-[#0066D6] w-full sm:w-auto";

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={`${overlayPanelClass} ring-0 md:ring-1 md:ring-black/[0.05]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-5 md:pt-4">
          <h2 id="client-form-title" className="text-lg font-semibold tracking-tight text-zinc-900 pr-2">
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
            {!client ? (
              <div className="mb-5 rounded-2xl border-0 bg-[#007AFF]/[0.06] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#007AFF] focus:ring-[#007AFF] disabled:opacity-50"
                    checked={importFromProspection}
                    disabled={prospects.length === 0}
                                       onChange={(e) => {
                      const on = e.target.checked;
                      setImportFromProspection(on);
                      setImportProspectId("");
                      setProspectSearchQuery("");
                      if (!on) {
                        setFormData(defaultNewClientForm());
                      }
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      Remplir depuis la prospection
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Cochez la case puis choisissez une entreprise déjà suivie en prospection pour préremplir le
                      formulaire (nom, contact, téléphone, e-mail).
                    </span>
                  </span>
                </label>
                {importFromProspection ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className={lightLabelClass} htmlFor="client-import-prospect-search">
                        Rechercher un prospect
                      </label>
                      <div className="relative">
                        <FaSearch
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500"
                          aria-hidden
                        />
                        <input
                          id="client-import-prospect-search"
                          type="search"
                          autoComplete="off"
                          placeholder="Entreprise, contact, e-mail, téléphone…"
                          value={prospectSearchQuery}
                          onChange={(e) => setProspectSearchQuery(e.target.value)}
                          className={`${lightInputClass} pl-10`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        {prospectSearchQuery.trim()
                          ? `${filteredProspectsForImport.length} résultat${filteredProspectsForImport.length > 1 ? "s" : ""} sur ${prospects.length}`
                          : `${prospects.length} prospect${prospects.length > 1 ? "s" : ""} — tapez pour filtrer`}
                      </p>
                    </div>
                    <div>
                      <label className={lightLabelClass} htmlFor="client-import-prospect">
                        Choisir dans la liste
                      </label>
                      <select
                        id="client-import-prospect"
                        value={importProspectId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setImportProspectId(id);
                          if (!id) return;
                          const p = prospects.find((x) => x.id === id);
                          if (p) setFormData(prospectToFormFields(p));
                        }}
                        className={lightInputClass}
                        disabled={filteredProspectsForImport.length === 0 && prospectSearchQuery.trim() !== ""}
                      >
                        <option value="">
                          {filteredProspectsForImport.length === 0 && prospectSearchQuery.trim() !== ""
                            ? "— Aucun résultat —"
                            : "— Choisir une entreprise —"}
                        </option>
                        {filteredProspectsForImport.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.entreprise}
                            {p.contactNom ? ` · ${p.contactNom}` : ""}
                            {p.urgent ? " (urgent)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
                {prospects.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Aucun prospect enregistré en prospection.</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className={lightLabelClass}>Nom de l&apos;entreprise</label>
              <input
                type="text"
                required
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                className={lightInputClass}
              />
            </div>

            <div>
              <label className={lightLabelClass}>Nom du patron</label>
              <input
                type="text"
                required
                value={formData.patron}
                onChange={(e) => setFormData({ ...formData, patron: e.target.value })}
                className={lightInputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lightLabelClass}>Téléphone</label>
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className={lightInputClass}
                />
              </div>

              <div>
                <label className={lightLabelClass}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={lightInputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lightLabelClass}>Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) =>
                    setFormData({ ...formData, statut: e.target.value as "Actif" | "Inactif" | "Prospect" })
                  }
                  className={lightInputClass}
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>

              <div>
                <label className={lightLabelClass} htmlFor="client-abonnement">
                  Offre d&apos;abonnement
                </label>
                <select
                  id="client-abonnement"
                  value={formData.abonnement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      abonnement: e.target.value as AbonnementOffre,
                    })
                  }
                  className={lightInputClass}
                >
                  {ABONNEMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lightLabelClass} htmlFor="client-secteur-select">
                Secteur d&apos;activité
              </label>
              <select
                id="client-secteur-select"
                value={secteurSelectValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === SECTEUR_ACTIVITE_VIDE) {
                    setFormData({ ...formData, secteurActivite: "" });
                  } else if (v === SECTEUR_ACTIVITE_AUTRE) {
                    setFormData({
                      ...formData,
                      secteurActivite: isSecteurActiviteInList(formData.secteurActivite)
                        ? ""
                        : formData.secteurActivite,
                    });
                  } else {
                    setFormData({ ...formData, secteurActivite: v });
                  }
                }}
                className={lightInputClass}
              >
                <option value={SECTEUR_ACTIVITE_VIDE}>— Non renseigné —</option>
                {SECTEURS_ACTIVITE_OPTIONS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
                <option value={SECTEUR_ACTIVITE_AUTRE}>Autre (préciser ci-dessous)</option>
              </select>
              {secteurSelectValue === SECTEUR_ACTIVITE_AUTRE ? (
                <div className="mt-2">
                  <label className={lightLabelClass} htmlFor="client-secteur-autre">
                    Précisez le secteur
                  </label>
                  <input
                    id="client-secteur-autre"
                    type="text"
                    value={formData.secteurActivite}
                    onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                    placeholder="Saisie libre si votre secteur n'est pas dans la liste"
                    className={lightInputClass}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className={lightLabelClass}>Dernière activité</label>
              <input
                type="text"
                required
                value={formData.derniereActivite}
                onChange={(e) => setFormData({ ...formData, derniereActivite: e.target.value })}
                placeholder="DD/MM/YYYY"
                className={lightInputClass}
              />
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={violetPrimaryBtn}>
              {client ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
