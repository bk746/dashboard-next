"use client";

import { useState, useEffect, useMemo } from "react";
import { useCompany } from "@/app/hooks/useCompany";
import type { CompanySettings } from "@/app/config/company";
import ChangePinPanel from "@/app/parametres/ChangePinPanel";
import DashboardLayoutPanel from "@/app/parametres/DashboardLayoutPanel";
import {
  parametresShellClass,
  parametresPrimaryBtn,
  parametresFloatingCard,
  parametresInputClass,
  parametresLabelClass,
  parametresSectionTitle,
  parametresSegmentedBar,
  parametresTabActive,
  parametresTabInactive,
} from "./parametresUi";

type Tab = "entreprise" | "dashboard" | "code";

export default function Parametres() {
  const [tab, setTab] = useState<Tab>("entreprise");
  const [company, setCompany] = useCompany();
  const [form, setForm] = useState<CompanySettings>(company);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(company);
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const update = (field: keyof CompanySettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className={parametresShellClass}>
      <div className="md:max-w-[900px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 space-y-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[#5E549E] sm:text-[28px]">
              Paramètres
            </h1>
            <p className="mt-1 text-sm text-zinc-500 capitalize">{dateLabel}</p>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Informations entreprise, disposition du dashboard et code d&apos;accès local.
            </p>
          </div>

          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            role="tablist"
            aria-label="Sections paramètres"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Afficher</p>
            <div className={parametresSegmentedBar}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "entreprise"}
                onClick={() => setTab("entreprise")}
                className={tab === "entreprise" ? parametresTabActive : parametresTabInactive}
              >
                Entreprise
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "dashboard"}
                onClick={() => setTab("dashboard")}
                className={tab === "dashboard" ? parametresTabActive : parametresTabInactive}
              >
                Dashboard
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "code"}
                onClick={() => setTab("code")}
                className={tab === "code" ? parametresTabActive : parametresTabInactive}
              >
                Code d&apos;accès
              </button>
            </div>
          </div>
        </header>

        {tab === "code" ? (
          <ChangePinPanel />
        ) : tab === "dashboard" ? (
          <DashboardLayoutPanel />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={parametresFloatingCard}>
              <h3 className={parametresSectionTitle}>Infos personnelles &amp; entreprise</h3>

              <div className="mt-6 space-y-4">
                <div>
                  <label className={parametresLabelClass}>Dénomination / Nom</label>
                  <input
                    type="text"
                    value={form.denomination}
                    onChange={(e) => update("denomination", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={parametresLabelClass}>SIREN</label>
                    <input
                      type="text"
                      value={form.siren}
                      onChange={(e) => update("siren", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                  <div>
                    <label className={parametresLabelClass}>SIRET</label>
                    <input
                      type="text"
                      value={form.siret}
                      onChange={(e) => update("siret", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={parametresLabelClass}>Code APE</label>
                  <input
                    type="text"
                    value={form.codeApe}
                    onChange={(e) => update("codeApe", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div>
                  <label className={parametresLabelClass}>Forme juridique</label>
                  <input
                    type="text"
                    value={form.formeJuridique}
                    onChange={(e) => update("formeJuridique", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div>
                  <label className={parametresLabelClass}>Adresse</label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => update("adresse", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={parametresLabelClass}>Code postal</label>
                    <input
                      type="text"
                      value={form.codePostal}
                      onChange={(e) => update("codePostal", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                  <div>
                    <label className={parametresLabelClass}>Ville</label>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={(e) => update("ville", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={parametresLabelClass}>Pays</label>
                  <input
                    type="text"
                    value={form.pays}
                    onChange={(e) => update("pays", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div>
                  <label className={parametresLabelClass}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div>
                  <label className={parametresLabelClass}>Téléphone</label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) => update("telephone", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div>
                  <label className={parametresLabelClass}>TVA (mention légale)</label>
                  <input
                    type="text"
                    value={form.tva}
                    onChange={(e) => update("tva", e.target.value)}
                    className={parametresInputClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={parametresLabelClass}>Date d&apos;immatriculation</label>
                    <input
                      type="text"
                      value={form.dateImmatriculation}
                      onChange={(e) => update("dateImmatriculation", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                  <div>
                    <label className={parametresLabelClass}>Département</label>
                    <input
                      type="text"
                      value={form.departement}
                      onChange={(e) => update("departement", e.target.value)}
                      className={parametresInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className={parametresPrimaryBtn}>
                Enregistrer
              </button>
              {saved ? (
                <span className="text-sm font-medium text-emerald-600">Modifications enregistrées.</span>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
