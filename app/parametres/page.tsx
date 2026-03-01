"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/app/hooks/useCompany";
import { useTheme } from "@/app/context/ThemeContext";
import type { CompanySettings } from "@/app/config/company";

export default function Parametres() {
  const [company, setCompany] = useCompany();
  const [form, setForm] = useState<CompanySettings>(company);
  const [saved, setSaved] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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
    <div className="min-h-screen w-full bg-[#f6f6f6] md:bg-[#f8f8f7] dark:bg-black p-3 sm:p-4 md:p-8 md:px-10 lg:px-12">
      <div className="md:max-w-[900px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-6 md:mb-8">
          <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-[0.2em] font-medium mb-1 md:block">Compte</p>
          <h1 className="text-[#ED8600] dark:text-blue-800 font-bold text-2xl sm:text-xl md:text-[28px] tracking-tight">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-[15px] mt-0.5">
            Modifiez vos informations personnelles et entreprise.
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent hidden md:block" />
        </header>

        {/* Apparence / Mode sombre */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl p-6 md:p-8 bg-white dark:bg-black md:shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none mb-6 mx-4 sm:mx-6 md:mx-0">
          <h3 className="text-gray-600 dark:text-gray-400 font-semibold text-base md:text-[15px] mb-4">Apparence</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Mode sombre</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Activer ou désactiver le thème sombre sur tout le site</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 dark:focus:ring-offset-black ${
                isDark ? "bg-blue-800" : "bg-[#ED8600]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDark ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-6 md:px-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl p-6 md:p-8 bg-white dark:bg-black md:shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
            <h3 className="text-gray-600 dark:text-gray-400 font-semibold text-base md:text-[15px] mb-4">Infos personnelles</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Dénomination / Nom</label>
                <input
                  type="text"
                  value={form.denomination}
                  onChange={(e) => update("denomination", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">SIREN</label>
                  <input
                    type="text"
                    value={form.siren}
                    onChange={(e) => update("siren", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">SIRET</label>
                  <input
                    type="text"
                    value={form.siret}
                    onChange={(e) => update("siret", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Code APE</label>
                <input
                  type="text"
                  value={form.codeApe}
                  onChange={(e) => update("codeApe", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Forme juridique</label>
                <input
                  type="text"
                  value={form.formeJuridique}
                  onChange={(e) => update("formeJuridique", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => update("adresse", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Code postal</label>
                  <input
                    type="text"
                    value={form.codePostal}
                    onChange={(e) => update("codePostal", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Ville</label>
                  <input
                    type="text"
                    value={form.ville}
                    onChange={(e) => update("ville", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Pays</label>
                <input
                  type="text"
                  value={form.pays}
                  onChange={(e) => update("pays", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => update("telephone", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">TVA (mention légale)</label>
                <input
                  type="text"
                  value={form.tva}
                  onChange={(e) => update("tva", e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Date d’immatriculation</label>
                  <input
                    type="text"
                    value={form.dateImmatriculation}
                    onChange={(e) => update("dateImmatriculation", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">Département</label>
                  <input
                    type="text"
                    value={form.departement}
                    onChange={(e) => update("departement", e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#ED8600] dark:bg-blue-800 rounded-xl text-white font-medium shadow-lg shadow-[#ED8600]/25 dark:shadow-blue-800/25 hover:opacity-95 transition-all duration-200"
            >
              Enregistrer
            </button>
            {saved && (
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Modifications enregistrées.</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
