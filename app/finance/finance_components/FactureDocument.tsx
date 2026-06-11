"use client";

import { useState } from "react";
import { FaTimes, FaPrint, FaEnvelope, FaFileDownload } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import { DEVIS_INCLUS_PREFIX } from "@/app/estimation/estimation_utils";
import type { Client, Facture, PrestationDevis } from "@/app/types";
import { getMontantAcompteFacture, getResteAPayerFacture } from "@/app/finance/utils";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass } from "@/app/components/appCardStyles";
import type { DocumentPdfData } from "@/lib/pdf/documentPdf";
import { downloadDocumentPdf, sendDocumentByEmail } from "@/lib/pdf/documentActions";

interface FactureDocumentProps {
  facture: Facture;
  client?: Client | null;
  onClose: () => void;
}

function estLigneInclusForfait(p: PrestationDevis): boolean {
  if (p.inclusForfait) return true;
  return p.prix === 0 && p.designation.startsWith(DEVIS_INCLUS_PREFIX);
}

function designationLigne(p: PrestationDevis): string {
  if (p.designation.startsWith(DEVIS_INCLUS_PREFIX)) {
    return p.designation.slice(DEVIS_INCLUS_PREFIX.length);
  }
  return p.designation;
}

function montantLigne(p: PrestationDevis): string {
  if (estLigneInclusForfait(p)) return "Inclus";
  return `${p.prix.toLocaleString("fr-FR")} €`;
}

function lignesFacture(facture: Facture): PrestationDevis[] {
  if (facture.prestations && facture.prestations.length > 0) return facture.prestations;
  const designation =
    facture.abonnement && facture.abonnement !== "Aucun"
      ? `Prestation / Abonnement — ${facture.abonnement}`
      : "Prestation / Abonnement";
  return [{ designation, prix: facture.prix }];
}

function buildEmailContent(facture: Facture, company: CompanySettings) {
  const ac = getMontantAcompteFacture(facture);
  const reste = getResteAPayerFacture(facture);
  const lines = [
    "Bonjour,",
    "",
    `Veuillez trouver ci-joint notre facture n° ${facture.numeroFacture} en date du ${facture.date}.`,
    `Montant total TTC : ${facture.prix.toLocaleString("fr-FR")} €`,
  ];
  if (ac > 0) {
    lines.push(`Acompte déjà versé : ${ac.toLocaleString("fr-FR")} €`);
    lines.push(`Reste à payer : ${reste.toLocaleString("fr-FR")} €`);
  }
  if (facture.dateEcheance) lines.push(`Échéance de paiement : ${facture.dateEcheance}`);
  if (company.iban) lines.push(`Règlement par virement — IBAN : ${company.iban}`);
  lines.push("", "Cordialement,", company.denomination);
  return {
    subject: `Facture ${facture.numeroFacture} – ${facture.entreprise}`,
    body: lines.join("\n"),
  };
}

const toolbarBtn =
  "inline-flex items-center gap-2 rounded-full bg-zinc-100/80 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-50";

type EmailState = "idle" | "sending" | "sent" | "fallback" | "error";

export default function FactureDocument({ facture, client, onClose }: FactureDocumentProps) {
  const [company] = useCompany();
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [pdfBusy, setPdfBusy] = useState(false);

  const montantAcompte = getMontantAcompteFacture(facture);
  const resteAPayer = getResteAPayerFacture(facture);
  const hasAcompte = montantAcompte > 0;
  const lignes = lignesFacture(facture);

  const pdfData: DocumentPdfData = {
    kind: "facture",
    numero: facture.numeroFacture,
    date: facture.date,
    statut: facture.statut,
    dateEcheance: facture.dateEcheance,
    entreprise: facture.entreprise,
    clientNom: client?.patron || undefined,
    clientEmail: client?.email || undefined,
    clientTelephone: client?.telephone || undefined,
    lignes: lignes.map((p) => ({
      designation: designationLigne(p) || "Prestation",
      montant: montantLigne(p),
      inclus: estLigneInclusForfait(p),
    })),
    totalLabel: `${facture.prix.toLocaleString("fr-FR")} €`,
    acompteLabel: hasAcompte ? `${montantAcompte.toLocaleString("fr-FR")} €` : undefined,
    resteLabel: hasAcompte ? `${resteAPayer.toLocaleString("fr-FR")} €` : undefined,
    company,
  };

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadDocumentPdf(pdfData);
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSendEmail = async () => {
    const dest = client?.email?.trim() ?? "";
    const { subject, body } = buildEmailContent(facture, company);
    setEmailState("sending");
    const result = await sendDocumentByEmail({ data: pdfData, to: dest, subject, body });
    if (result.status === "sent") setEmailState("sent");
    else if (result.status === "fallback_mailto") setEmailState("fallback");
    else setEmailState("error");
  };

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
            <button type="button" onClick={handleDownloadPdf} disabled={pdfBusy} className={toolbarBtn}>
              <FaFileDownload aria-hidden />
              <span className="hidden sm:inline">{pdfBusy ? "Génération…" : "Télécharger PDF"}</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button type="button" onClick={() => window.print()} className={toolbarBtn}>
              <FaPrint aria-hidden />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={emailState === "sending"}
              className={toolbarBtn}
            >
              <FaEnvelope aria-hidden />
              <span className="hidden sm:inline">
                {emailState === "sending" ? "Envoi…" : "Envoyer par mail"}
              </span>
              <span className="sm:hidden">Mail</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Fermer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          {emailState === "sent" ? (
            <p className="w-full text-right text-xs font-medium text-emerald-600" role="status">
              Email envoyé avec la facture en pièce jointe.
            </p>
          ) : emailState === "fallback" ? (
            <p className="w-full text-right text-xs font-medium text-amber-600" role="status">
              Envoi direct non configuré — PDF téléchargé et brouillon ouvert dans votre client mail.
            </p>
          ) : emailState === "error" ? (
            <p className="w-full text-right text-xs font-medium text-rose-600" role="alert">
              Échec de l&apos;envoi — réessayez ou utilisez « Télécharger PDF ».
            </p>
          ) : null}
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
                    {facture.dateEcheance ? (
                      <div className="flex gap-2">
                        <dt>Échéance</dt>
                        <dd className="tabular-nums text-zinc-900">{facture.dateEcheance}</dd>
                      </div>
                    ) : null}
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
                  {lignes.map((p, i) => {
                    const inclus = estLigneInclusForfait(p);
                    return (
                      <tr key={i} className="border-b border-zinc-100">
                        <td className={`py-4 pr-4 ${inclus ? "pl-5 text-zinc-500" : "text-zinc-900"}`}>
                          {inclus ? (
                            <span className="mr-2 text-zinc-300" aria-hidden>
                              —
                            </span>
                          ) : null}
                          {designationLigne(p) || "Prestation"}
                        </td>
                        <td
                          className={`py-4 text-right tabular-nums ${
                            inclus ? "font-normal text-zinc-400" : "font-medium text-zinc-900"
                          }`}
                        >
                          {montantLigne(p)}
                        </td>
                      </tr>
                    );
                  })}
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

            <section className="px-8 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                <p className="text-xs font-medium text-zinc-400">Modalités de paiement</p>
                <div className="mt-2 space-y-1 text-[13px] leading-relaxed text-zinc-500">
                  <p>
                    {facture.dateEcheance
                      ? `Paiement à réception, au plus tard le ${facture.dateEcheance}.`
                      : "Paiement à réception de la facture."}
                  </p>
                  {company.iban ? (
                    <p>
                      Virement bancaire — IBAN : <span className="tabular-nums">{company.iban}</span>
                      {company.bic ? ` — BIC : ${company.bic}` : ""}
                    </p>
                  ) : null}
                  <p className="text-xs text-zinc-400">
                    Tout retard de paiement entraîne des pénalités au taux légal en vigueur ainsi
                    qu&apos;une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 du
                    Code de commerce).
                  </p>
                </div>
              </div>
            </section>

            <footer className="mt-auto px-8 py-12 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                <p className="mb-8 text-[13px] leading-relaxed text-zinc-500">
                  {facture.statut === "Payé"
                    ? "Facture réglée. Merci pour votre confiance."
                    : "Merci de régler cette facture selon les modalités ci-dessus."}
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
