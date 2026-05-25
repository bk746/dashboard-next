"use client";

import { FaTimes, FaPrint, FaEnvelope } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import type { Client, Facture } from "@/app/types";
import { getMontantAcompteFacture, getResteAPayerFacture } from "@/app/finance/utils";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass } from "@/app/components/appCardStyles";

interface FactureDocumentProps {
  facture: Facture;
  client?: Client | null;
  onClose: () => void;
}

function buildFactureMailto(facture: Facture, client: Client | null | undefined, company: CompanySettings): string {
  const subject = `Facture ${facture.numeroFacture} – ${facture.entreprise}`;
  const ac = getMontantAcompteFacture(facture);
  const reste = getResteAPayerFacture(facture);
  const bodyLines = [
    "Bonjour,",
    "",
    `Veuillez trouver notre facture n° ${facture.numeroFacture} en date du ${facture.date}.`,
    `Montant total TTC : ${facture.prix.toLocaleString("fr-FR")} €`,
  ];
  if (ac > 0) {
    bodyLines.push(`Acompte déjà versé : ${ac.toLocaleString("fr-FR")} €`);
    bodyLines.push(`Reste à payer : ${reste.toLocaleString("fr-FR")} €`);
  }
  bodyLines.push(`Statut : ${facture.statut}`, "", "Cordialement,", company.denomination);
  const body = bodyLines.join("\n");
  const dest = client?.email?.trim();
  const base = dest ? `mailto:${encodeURIComponent(dest)}` : "mailto:";
  return `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const toolbarBtn =
  "inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100";

function designationFacture(facture: Facture): string {
  if (facture.abonnement && facture.abonnement !== "Aucun") {
    return `Prestation / Abonnement — ${facture.abonnement}`;
  }
  return "Prestation / Abonnement";
}

export default function FactureDocument({ facture, client, onClose }: FactureDocumentProps) {
  const [company] = useCompany();
  const mailtoHref = buildFactureMailto(facture, client, company);
  const montantAcompte = getMontantAcompteFacture(facture);
  const resteAPayer = getResteAPayerFacture(facture);
  const hasAcompte = montantAcompte > 0;

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className="no-print mx-2 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] sm:mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facture-preview-title"
      >
        <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-5">
          <h2 id="facture-preview-title" className="text-base font-semibold tracking-tight text-neutral-900">
            Aperçu de la facture
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
            className="facture-print-area mx-auto bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            style={{ maxWidth: "210mm", minHeight: "297mm" }}
          >
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
                  <p className="text-3xl font-bold uppercase tracking-[0.12em] text-black md:text-4xl">Facture</p>
                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex gap-3 sm:justify-end">
                      <dt className="font-medium text-neutral-500">N°</dt>
                      <dd className="font-semibold tabular-nums text-black">{facture.numeroFacture}</dd>
                    </div>
                    <div className="flex gap-3 sm:justify-end">
                      <dt className="font-medium text-neutral-500">Date</dt>
                      <dd className="tabular-nums text-black">{facture.date}</dd>
                    </div>
                    <div className="flex gap-3 sm:justify-end">
                      <dt className="font-medium text-neutral-500">Statut</dt>
                      <dd className="font-semibold text-black">{facture.statut}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </header>

            <section className="px-8 py-8 md:px-12">
              <div className="border border-neutral-300 bg-neutral-50 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">Client</p>
                <p className="mt-2 text-lg font-semibold text-black">{facture.entreprise}</p>
                <div className="mt-2 space-y-0.5 text-sm text-neutral-600">
                  {client?.patron ? <p>{client.patron}</p> : null}
                  {client?.email ? <p>{client.email}</p> : null}
                  {client?.telephone ? <p>{client.telephone}</p> : null}
                </div>
              </div>
            </section>

            <section className="px-8 md:px-12">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-y-2 border-black bg-black text-left text-white">
                    <th className="px-4 py-3 font-semibold uppercase tracking-wide">Désignation</th>
                    <th className="w-32 px-4 py-3 text-right font-semibold uppercase tracking-wide">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200 bg-white">
                    <td className="px-4 py-3.5 text-black">{designationFacture(facture)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-black">
                      {facture.prix.toLocaleString("fr-FR")} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="px-8 py-8 md:px-12">
              <div className="flex justify-end">
                <div className="min-w-[16rem] border-2 border-black">
                  <div className="flex items-baseline justify-between gap-6 border-b border-neutral-200 px-6 py-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                      Total TTC
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-black">
                      {facture.prix.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                  {hasAcompte ? (
                    <>
                      <div className="flex items-baseline justify-between gap-6 border-b border-neutral-200 px-6 py-3 text-sm">
                        <span className="text-neutral-600">Acompte versé</span>
                        <span className="font-medium tabular-nums text-neutral-700">
                          − {montantAcompte.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-6 bg-neutral-50 px-6 py-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                          Reste à payer
                        </span>
                        <span className="text-xl font-bold tabular-nums text-black">
                          {resteAPayer.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </section>

            <footer className="mt-auto border-t border-neutral-300 px-8 py-8 md:px-12">
              <p className="mb-6 text-sm text-neutral-600">
                <span className="font-semibold text-black">Paiement :</span>{" "}
                {facture.statut === "Payé"
                  ? "Facture réglée. Merci pour votre confiance."
                  : "Merci de régler cette facture selon les modalités convenues. En cas de retard, des pénalités pourront être appliquées conformément à la réglementation en vigueur."}
              </p>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-sm text-neutral-600">
                  Fait à {company.ville || "—"}, le {facture.date}
                </p>
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    Mentions légales
                  </p>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-neutral-500">
                    {company.tva || "TVA non applicable, art. 293 B du CGI."}
                  </p>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
