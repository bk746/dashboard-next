"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Client, EstimationSaved } from "@/app/types";
import { computeTotalsForEstimation, emptyEstimationPayload } from "@/app/estimation/estimation_utils";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  estimationShellClass,
  estimationPrimaryBtn,
  estimationSecondaryBtn,
  estimationFloatingCard,
  estimationLightPanel,
  estimationLightInput,
  estimationLightLabel,
  estimationVioletPrimaryBtn,
} from "@/app/estimation/estimationUi";
import { overlayBackdropClass, overlayScrollBodyClass } from "@/app/components/appCardStyles";
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

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const openNewModal = () => {
    setNewClientId(clients[0]?.id ?? "");
    setNewLibelle("");
    setShowNew(true);
  };

  const createEstimation = () => {
    if (!newClientId) return;
    const id = crypto.randomUUID();
    const payload = emptyEstimationPayload(id, newClientId, newLibelle);
    setEstimations([...estimations, payload]);
    setShowNew(false);
    router.push(`/estimation/${id}`);
  };

  const deleteEstimation = (id: string) => {
    if (!confirm("Supprimer cette estimation ?")) return;
    setEstimations(estimations.filter((e) => e.id !== id));
  };

  return (
    <div className={estimationShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]">
              Estimations
            </h1>
            <p className="mt-1 text-sm text-zinc-500 capitalize">{dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={openNewModal}
            className={estimationPrimaryBtn}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nouvelle estimation
          </button>
        </header>

        {!ready ? (
          <p className="px-1 text-sm text-zinc-500">Chargement…</p>
        ) : sorted.length === 0 ? (
          <div className={`${estimationFloatingCard} flex flex-col items-center justify-center px-6 py-16 text-center`}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
              <FileSpreadsheet className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-base font-semibold text-zinc-800">Aucune estimation</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Liez une estimation à un{" "}
              <Link href="/clients" className="font-medium text-[#007AFF] hover:underline">
                client
              </Link>
              , puis créez votre première fiche.
            </p>
            <button type="button" onClick={openNewModal} className={`${estimationPrimaryBtn} mt-6`}>
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle estimation
            </button>
          </div>
        ) : (
          <div className={estimationFloatingCard}>
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-zinc-900">
                {sorted.length} estimation{sorted.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Entreprise
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 hidden sm:table-cell">
                      Libellé
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 hidden md:table-cell">
                      Modifié
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 text-right">
                      Total projet
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 text-right hidden lg:table-cell">
                      Maint. / mois
                    </th>
                    <th className="px-4 py-3 w-28 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((est) => {
                    const { totalOneShot, maintenanceMonthly } = computeTotalsForEstimation(est);
                    return (
                      <tr
                        key={est.id}
                        className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-[#007AFF]/[0.04]"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/estimation/${est.id}`}
                            className="font-medium text-zinc-900 hover:text-[#007AFF]"
                          >
                            {entrepriseFor(est, clients)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 hidden sm:table-cell">{est.libelle ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell whitespace-nowrap">
                          {dateFmt.format(new Date(est.updatedAt))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-800">
                          {eur.format(totalOneShot)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-600 hidden lg:table-cell">
                          {maintenanceMonthly > 0 ? eur.format(maintenanceMonthly) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/estimation/${est.id}`}
                              className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#007AFF] hover:bg-[#007AFF]/10"
                            >
                              Ouvrir
                            </Link>
                            <button
                              type="button"
                              onClick={() => deleteEstimation(est.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
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

      {showNew ? (
        <div className={overlayBackdropClass} role="dialog" aria-modal="true" aria-labelledby="new-est-title">
          <div className={estimationLightPanel} onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
              <h2 id="new-est-title" className="text-lg font-semibold tracking-tight text-zinc-900">
                Nouvelle estimation
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                onClick={() => setShowNew(false)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={overlayScrollBodyClass}>
              {clients.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  Aucun client.{" "}
                  <Link href="/clients" className="font-medium text-[#007AFF] hover:underline">
                    Ajoutez un client
                  </Link>{" "}
                  d&apos;abord.
                </p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className={estimationLightLabel} htmlFor="new-est-client">
                      Client
                    </label>
                    <select
                      id="new-est-client"
                      className={estimationLightInput}
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
                    <label className={estimationLightLabel} htmlFor="new-est-libelle">
                      Libellé (optionnel)
                    </label>
                    <input
                      id="new-est-libelle"
                      type="text"
                      className={estimationLightInput}
                      placeholder="Ex. Refonte site 2025"
                      value={newLibelle}
                      onChange={(e) => setNewLibelle(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
              <button type="button" className={estimationSecondaryBtn} onClick={() => setShowNew(false)}>
                Annuler
              </button>
              <button
                type="button"
                className={estimationVioletPrimaryBtn}
                onClick={createEstimation}
                disabled={clients.length === 0 || !newClientId}
              >
                Créer et ouvrir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
