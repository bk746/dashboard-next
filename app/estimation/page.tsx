"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Client, EstimationSaved } from "@/app/types";
import { computeTotalsForEstimation, emptyEstimationPayload } from "@/app/estimation/estimation_utils";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  panelSurfaceClass,
  primaryButtonClass,
  secondaryButtonClass,
  inputFieldClass,
  formLabelClass,
  overlayBackdropClass,
  overlayPanelNarrowClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
} from "@/app/components/appCardStyles";
import { FileSpreadsheet, Plus, Trash2, X } from "lucide-react";

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

function entrepriseFor(est: EstimationSaved, clients: Client[]): string {
  const c = clients.find((x) => x.id === est.clientId);
  return c?.entreprise ?? "Client inconnu ou supprimé";
}

export default function EstimationListPage() {
  const router = useRouter();
  const [clients] = useJsonBucket<Client[]>("clients", []);
  const [estimations, setEstimations, ready] = useJsonBucket<EstimationSaved[]>("estimations", []);
  const [showNew, setShowNew] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newLibelle, setNewLibelle] = useState("");

  const sorted = useMemo(() => {
    return [...estimations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [estimations]);

  const openNewModal = () => {
    setNewClientId(clients[0]?.id ?? "");
    setNewLibelle("");
    setShowNew(true);
  };

  const createEstimation = () => {
    if (!newClientId) return;
    const id = crypto.randomUUID();
    const payload = emptyEstimationPayload(id, newClientId, newLibelle);
    const next = [...estimations, payload];
    setEstimations(next);
    setShowNew(false);
    router.push(`/estimation/${id}`);
  };

  const deleteEstimation = (id: string) => {
    if (!confirm("Supprimer cette estimation ?")) return;
    setEstimations(estimations.filter((e) => e.id !== id));
  };

  return (
    <div className={pageShellClass}>
      <div className="max-w-5xl mx-auto">
        <p className={pageEyebrowClass}>Finance</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={pageTitleClass}>Estimations</h1>
            <p className={pageSubtitleClass}>
              Chaque estimation est liée à un client (nom d&apos;entreprise depuis la page Clients). Créez une
              nouvelle fiche ou rouvrez une estimation existante.
            </p>
          </div>
          <button type="button" onClick={openNewModal} className={primaryButtonClass + " inline-flex items-center gap-2 shrink-0"}>
            <Plus className="h-4 w-4" aria-hidden />
            Nouvelle estimation
          </button>
        </div>

        <div className="mt-8">
          {!ready ? (
            <p className="text-sm text-zinc-500">Chargement…</p>
          ) : sorted.length === 0 ? (
            <div className={`${panelSurfaceClass} p-8 text-center`}>
              <FileSpreadsheet className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" aria-hidden />
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Aucune estimation pour le moment. Ajoutez d&apos;abord des clients dans{" "}
                <Link href="/clients" className="text-[#ED8600] dark:text-[#8fa9c9] font-medium hover:underline">
                  Clients
                </Link>
                , puis créez une estimation.
              </p>
              <button type="button" onClick={openNewModal} className={primaryButtonClass + " inline-flex items-center gap-2"}>
                <Plus className="h-4 w-4" aria-hidden />
                Nouvelle estimation
              </button>
            </div>
          ) : (
            <div className={`${panelSurfaceClass} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/90 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-white/[0.03]">
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Entreprise</th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200 hidden sm:table-cell">
                        Libellé
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200 hidden md:table-cell">
                        Modifié
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200 text-right">
                        Total projet
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200 text-right hidden lg:table-cell">
                        Maint. / mois
                      </th>
                      <th className="px-4 py-3 w-28 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((est) => {
                      const { totalOneShot, maintenanceMonthly } = computeTotalsForEstimation(est);
                      return (
                        <tr
                          key={est.id}
                          className="border-b border-zinc-100 dark:border-white/[0.05] hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/estimation/${est.id}`}
                              className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-[#ED8600] dark:hover:text-[#8fa9c9]"
                            >
                              {entrepriseFor(est, clients)}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                            {est.libelle ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 dark:text-zinc-500 text-xs hidden md:table-cell whitespace-nowrap">
                            {dateFmt.format(new Date(est.updatedAt))}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                            {eur.format(totalOneShot)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">
                            {maintenanceMonthly > 0 ? eur.format(maintenanceMonthly) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/estimation/${est.id}`}
                                className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#ED8600] dark:text-[#8fa9c9] hover:bg-[#ED8600]/10 dark:hover:bg-white/[0.06]"
                              >
                                Ouvrir
                              </Link>
                              <button
                                type="button"
                                onClick={() => deleteEstimation(est.id)}
                                className="rounded-lg p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div className={overlayBackdropClass} role="dialog" aria-modal="true" aria-labelledby="new-est-title">
          <div className={overlayPanelNarrowClass}>
            <div className={overlayHeaderClass}>
              <h2 id="new-est-title" className={overlayTitleClass}>
                Nouvelle estimation
              </h2>
              <button
                type="button"
                className={overlayCloseButtonClass}
                onClick={() => setShowNew(false)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              {clients.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Aucun client enregistré.{" "}
                  <Link href="/clients" className="text-[#ED8600] dark:text-[#8fa9c9] font-medium hover:underline">
                    Ajoutez un client
                  </Link>{" "}
                  d&apos;abord.
                </p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className={formLabelClass} htmlFor="new-est-client">
                      Client (entreprise)
                    </label>
                    <select
                      id="new-est-client"
                      className={inputFieldClass}
                      value={newClientId}
                      onChange={(e) => setNewClientId(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.entreprise}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={formLabelClass} htmlFor="new-est-libelle">
                      Libellé (optionnel)
                    </label>
                    <input
                      id="new-est-libelle"
                      type="text"
                      className={inputFieldClass}
                      placeholder="Ex. Refonte site 2025"
                      value={newLibelle}
                      onChange={(e) => setNewLibelle(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className={overlayFooterClass}>
              <button type="button" className={secondaryButtonClass} onClick={() => setShowNew(false)}>
                Annuler
              </button>
              <button
                type="button"
                className={primaryButtonClass}
                onClick={createEstimation}
                disabled={clients.length === 0 || !newClientId}
              >
                Créer et ouvrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
