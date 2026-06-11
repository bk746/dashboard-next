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
  "inline-flex items-center gap-2 rounded-full bg-zinc-100/80 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200/70";

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
        className="mx-2 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#F5F5F7] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05] sm:mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facture-preview-title"
      >
        <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
          <h2 id="facture-preview-title" className="text-base font-semibold tracking-tight text-zinc-900">
            Facture {facture.numeroFacture}
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
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Fermer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <article
            className="facture-print-area mx-auto rounded-lg bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            style={{ maxWidth: "210mm", minHeight: "297mm" }}
          >
            <header className="px-8 pt-12 pb-10 md:px-14 md:pt-16">
              <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-[2rem] font-semibold tracking-tight text-zinc-900">Facture</h1>
                  <dl className="mt-3 space-y-1 text-sm text-zinc-500">
                    <div className="flex gap-2">
                      <dt>N°</dt>
                      <dd className="font-medium tabular-nums text-zinc-900">{facture.numeroFacture}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Date</dt>
                      <dd className="tabular-nums text-zinc-900">{facture.date}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Statut</dt>
                      <dd className="font-medium text-zinc-900">{facture.statut}</dd>
                    </div>
                  </dl>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-base font-semibold text-zinc-900">{company.denomination}</p>
                  <div className="mt-2 space-y-0.5 text-[13px] leading-relaxed text-zinc-500">
                    <p>
                      {company.formeJuridique}
                      {company.siret ? ` — SIRET ${company.siret}` : ""}
                    </p>
                    <p>{formatCompanyAddressLine(company)}</p>
                    <p>
                      {company.email}
                      {company.telephone ? ` — ${company.telephone}` : ""}
                    </p>
                    {company.tva ? <p>{company.tva}</p> : null}
                  </div>
                </div>
              </div>
            </header>

            <section className="px-8 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                <p className="text-xs font-medium text-zinc-400">Facturé à</p>
                <p className="mt-1.5 text-lg font-semibold text-zinc-900">{facture.entreprise}</p>
                <div className="mt-1 space-y-0.5 text-sm text-zinc-500">
                  {client?.patron ? <p>{client.patron}</p> : null}
                  {client?.email ? <p>{client.email}</p> : null}
                  {client?.telephone ? <p>{client.telephone}</p> : null}
                </div>
              </div>
            </section>

            <section className="px-8 pt-10 md:px-14">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="py-3 pr-4 text-xs font-medium text-zinc-400">Désignation</th>
                    <th className="w-32 py-3 text-right text-xs font-medium text-zinc-400">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <td className="py-4 pr-4 text-zinc-900">{designationFacture(facture)}</td>
                    <td className="py-4 text-right font-medium tabular-nums text-zinc-900">
                      {facture.prix.toLocaleString("fr-FR")} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="px-8 py-10 md:px-14">
              <div className="flex justify-end">
                <div className="min-w-[16rem] space-y-3">
                  <div className="flex items-baseline justify-between gap-8 border-t border-zinc-900 pt-4">
                    <span className="text-sm font-medium text-zinc-500">Total TTC</span>
                    <span className="text-[28px] font-semibold tracking-tight tabular-nums text-zinc-900">
                      {facture.prix.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                  {hasAcompte ? (
                    <>
                      <div className="flex items-baseline justify-between gap-8 text-sm">
                        <span className="text-zinc-500">Acompte versé</span>
                        <span className="font-medium tabular-nums text-zinc-600">
                          − {montantAcompte.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-8 border-t border-zinc-200 pt-3">
                        <span className="text-sm font-medium text-zinc-500">Reste à payer</span>
                        <span className="text-xl font-semibold tabular-nums text-zinc-900">
                          {resteAPayer.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </section>

            <footer className="mt-auto px-8 pb-12 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                <p className="mb-8 text-[13px] leading-relaxed text-zinc-500">
                  {facture.statut === "Payé"
                    ? "Facture réglée. Merci pour votre confiance."
                    : "Merci de régler cette facture selon les modalités convenues. En cas de retard, des pénalités pourront être appliquées conformément à la réglementation en vigueur."}
                </p>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <p className="text-[13px] text-zinc-500">
                    Fait à {company.ville || "—"}, le {facture.date}
                  </p>
                  <div className="sm:text-right">
                    <p className="text-xs font-medium text-zinc-400">Mentions légales</p>
                    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                      {company.tva || "TVA non applicable, art. 293 B du CGI."}
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
