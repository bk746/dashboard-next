"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/app/hooks/useCompany";
import type { CompanySettings } from "@/app/config/company";
import ChangePinPanel from "@/app/parametres/ChangePinPanel";
import DashboardLayoutPanel from "@/app/parametres/DashboardLayoutPanel";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  panelSurfaceClass,
  inputFieldClass,
  formLabelClass,
  sectionHeadingClass,
  primaryButtonClass,
  sectionIntroDescClass,
  segmentedBarClass,
  segmentedTabActiveClass,
  segmentedTabInactiveClass,
} from "@/app/components/appCardStyles";

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

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[900px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-7 md:mb-10">
          <p className={pageEyebrowClass}>Compte</p>
          <h1 className={pageTitleClass}>Paramètres</h1>
          <p className={pageSubtitleClass}>Modifiez vos informations personnelles et entreprise.</p>
          <p className={`${sectionIntroDescClass} mt-2 max-w-2xl`}>
            Ces données peuvent être réutilisées sur vos factures et devis lorsque vous les générez depuis l&apos;application.
          </p>
          <div className={pageDividerClass} aria-hidden />
          <div
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            role="tablist"
            aria-label="Sections paramètres"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Afficher</p>
            <div className={segmentedBarClass}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "entreprise"}
                onClick={() => setTab("entreprise")}
                className={tab === "entreprise" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Entreprise
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "dashboard"}
                onClick={() => setTab("dashboard")}
                className={tab === "dashboard" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Dashboard
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "code"}
                onClick={() => setTab("code")}
                className={tab === "code" ? segmentedTabActiveClass : segmentedTabInactiveClass}
              >
                Code d&apos;accès
              </button>
            </div>
          </div>
        </header>

        {tab === "code" ? (
          <div className="space-y-6 px-4 sm:px-6 md:px-0">
            <ChangePinPanel />
          </div>
        ) : tab === "dashboard" ? (
          <div className="space-y-6 px-4 sm:px-6 md:px-0">
            <DashboardLayoutPanel />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-6 md:px-0">
          <div className={`${panelSurfaceClass} p-6 md:p-8`}>
            <h3 className={sectionHeadingClass}>Infos personnelles</h3>

            <div className="space-y-4">
              <div>
                <label className={formLabelClass}>Dénomination / Nom</label>
                <input
                  type="text"
                  value={form.denomination}
                  onChange={(e) => update("denomination", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelClass}>SIREN</label>
                  <input
                    type="text"
                    value={form.siren}
                    onChange={(e) => update("siren", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>SIRET</label>
                  <input
                    type="text"
                    value={form.siret}
                    onChange={(e) => update("siret", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
              </div>
              <div>
                <label className={formLabelClass}>Code APE</label>
                <input
                  type="text"
                  value={form.codeApe}
                  onChange={(e) => update("codeApe", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Forme juridique</label>
                <input
                  type="text"
                  value={form.formeJuridique}
                  onChange={(e) => update("formeJuridique", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => update("adresse", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelClass}>Code postal</label>
                  <input
                    type="text"
                    value={form.codePostal}
                    onChange={(e) => update("codePostal", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Ville</label>
                  <input
                    type="text"
                    value={form.ville}
                    onChange={(e) => update("ville", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
              </div>
              <div>
                <label className={formLabelClass}>Pays</label>
                <input
                  type="text"
                  value={form.pays}
                  onChange={(e) => update("pays", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => update("telephone", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>TVA (mention légale)</label>
                <input
                  type="text"
                  value={form.tva}
                  onChange={(e) => update("tva", e.target.value)}
                  className={inputFieldClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelClass}>Date d&apos;immatriculation</label>
                  <input
                    type="text"
                    value={form.dateImmatriculation}
                    onChange={(e) => update("dateImmatriculation", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Département</label>
                  <input
                    type="text"
                    value={form.departement}
                    onChange={(e) => update("departement", e.target.value)}
                    className={inputFieldClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Enregistrer
            </button>
            {saved && (
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Modifications enregistrées.</span>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
