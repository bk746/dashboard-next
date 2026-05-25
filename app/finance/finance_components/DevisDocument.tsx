"use client";

import { FaTimes, FaPrint, FaEnvelope } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import { DEVIS_INCLUS_PREFIX } from "@/app/estimation/estimation_utils";
import type { Client, Devis, PrestationDevis } from "@/app/types";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass } from "@/app/components/appCardStyles";

function estLigneInclusForfait(p: PrestationDevis): boolean {
  if (p.inclusForfait) return true;
  return p.prix === 0 && p.designation.startsWith(DEVIS_INCLUS_PREFIX);
}

function designationLigneDevis(p: PrestationDevis): string {
  if (p.designation.startsWith(DEVIS_INCLUS_PREFIX)) {
    return p.designation.slice(DEVIS_INCLUS_PREFIX.length);
  }
  return p.designation;
}

function montantLigneDevis(p: PrestationDevis): string {
  if (estLigneInclusForfait(p)) return "Inclus";
  return `${p.prix.toLocaleString("fr-FR")} €`;
}

interface DevisDocumentProps {
  devis: Devis;
  client?: Client | null;
  onClose: () => void;
}

function buildDevisMailto(devis: Devis, client: Client | null | undefined, company: CompanySettings): string {
  const subject = `Devis ${devis.numeroDevis} – ${devis.entreprise}`;
  const body = [
    "Bonjour,",
    "",
    `Veuillez trouver notre proposition commerciale concernant le devis n° ${devis.numeroDevis} en date du ${devis.date}.`,
    `Montant total TTC : ${devis.prix.toLocaleString("fr-FR")} €`,
    devis.validite ? `Validité : ${devis.validite}` : "",
    "",
    "Cordialement,",
    company.denomination,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const dest = client?.email?.trim();
  const base = dest ? `mailto:${encodeURIComponent(dest)}` : "mailto:";
  return `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const toolbarBtn =
  "inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100";

export default function DevisDocument({ devis, client, onClose }: DevisDocumentProps) {
  const [company] = useCompany();
  const mailtoHref = buildDevisMailto(devis, client, company);
  const lignes =
    devis.prestations && devis.prestations.length > 0
      ? devis.prestations
      : [{ designation: "Prestation", prix: devis.prix, inclusForfait: false }];

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className="no-print mx-2 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] sm:mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="devis-preview-title"
      >
        <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-5">
          <h2 id="devis-preview-title" className="text-base font-semibold tracking-tight text-neutral-900">
            Aperçu du devis
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={() => window.print()} className={toolbarBtn}>
              <FaPrint aria-hidden />
              <span className="hidden sm:inline">Imprimer ou PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <a href={mailtoHref} className={toolbarBtn}>
              <FaEnvelope aria-hidden />
              <span className="hidden sm:inline">Envoyer par mail</span>
              <span className="sm:hidden">Mail</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Fermer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6">
          <article
            className="devis-print-area mx-auto bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            style={{ maxWidth: "210mm", minHeight: "297mm" }}
          >
            {/* En-tête */}
            <header className="border-b-2 border-black px-8 pt-10 pb-8 md:px-12 md:pt-12">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-neutral-500">
                    Émetteur
                  </p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-black md:text-[1.65rem]">
                    {company.denomination}
                  </h1>
                  <div className="mt-4 space-y-0.5 text-[13px] leading-relaxed text-neutral-600">
                    <p>
                      {company.formeJuridique}
                      {company.siret ? ` — SIRET ${company.siret}` : ""}
                    </p>
                    <p>{formatCompanyAddressLine(company)}</p>
                    <p>
                      {company.email}
                      {company.telephone ? ` — ${company.telephone}` : ""}
                    </p>
                    {company.tva ? <p className="text-neutral-500">{company.tva}</p> : null}
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-3xl font-bold uppercase tracking-[0.12em] text-black md:text-4xl">Devis</p>
                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex gap-3 sm:justify-end">
                      <dt className="font-medium text-neutral-500">N°</dt>
                      <dd className="font-semibold tabular-nums text-black">{devis.numeroDevis}</dd>
                    </div>
                    <div className="flex gap-3 sm:justify-end">
                      <dt className="font-medium text-neutral-500">Date</dt>
                      <dd className="tabular-nums text-black">{devis.date}</dd>
                    </div>
                    {devis.validite ? (
                      <div className="flex gap-3 sm:justify-end">
                        <dt className="font-medium text-neutral-500">Validité</dt>
                        <dd className="text-black">{devis.validite}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </div>
            </header>

            {/* Client */}
            <section className="px-8 py-8 md:px-12">
              <div className="border border-neutral-300 bg-neutral-50 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">Client</p>
                <p className="mt-2 text-lg font-semibold text-black">{devis.entreprise}</p>
                <div className="mt-2 space-y-0.5 text-sm text-neutral-600">
                  {client?.patron ? <p>{client.patron}</p> : null}
                  {client?.email ? <p>{client.email}</p> : null}
                  {client?.telephone ? <p>{client.telephone}</p> : null}
                </div>
              </div>
            </section>

            {/* Prestations */}
            <section className="px-8 md:px-12">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-y-2 border-black bg-black text-left text-white">
                    <th className="px-4 py-3 font-semibold uppercase tracking-wide">Désignation</th>
                    <th className="w-32 px-4 py-3 text-right font-semibold uppercase tracking-wide">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((p, i) => {
                    const inclus = estLigneInclusForfait(p);
                    return (
                      <tr
                        key={i}
                        className={`border-b border-neutral-200 ${i % 2 === 1 ? "bg-neutral-50/80" : "bg-white"}`}
                      >
                        <td className={`px-4 py-3.5 text-black ${inclus ? "pl-6 text-neutral-600" : ""}`}>
                          {inclus ? (
                            <span className="mr-2 text-neutral-400" aria-hidden>
                              —
                            </span>
                          ) : null}
                          {designationLigneDevis(p) || "Prestation"}
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right tabular-nums ${
                            inclus ? "font-normal text-neutral-500" : "font-semibold text-black"
                          }`}
                        >
                          {montantLigneDevis(p)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* Total */}
            <section className="px-8 py-8 md:px-12">
              <div className="flex justify-end">
                <div className="min-w-[14rem] border-2 border-black px-6 py-4">
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                      Total TTC
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-black">
                      {devis.prix.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pied de page */}
            <footer className="mt-auto border-t border-neutral-300 px-8 py-8 md:px-12">
              {devis.validite ? (
                <p className="mb-6 text-sm text-neutral-600">
                  <span className="font-semibold text-black">Conditions :</span> Ce devis est valable{" "}
                  {devis.validite}. Toute commande implique l&apos;acceptation de nos conditions générales de vente.
                </p>
              ) : (
                <p className="mb-6 text-sm text-neutral-600">
                  Toute commande implique l&apos;acceptation de nos conditions générales de vente.
                </p>
              )}
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-sm text-neutral-600">
                  Fait à {company.ville || "—"}, le {devis.date}
                </p>
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    Bon pour accord
                  </p>
                  <div className="mt-10 border-b border-black w-48 sm:ml-auto" aria-hidden />
                  <p className="mt-2 text-xs text-neutral-500">Date et signature du client</p>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
