"use client";

import { useState } from "react";
import { FaTimes, FaPrint, FaEnvelope, FaFileDownload } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import { DEVIS_INCLUS_PREFIX } from "@/app/estimation/estimation_utils";
import type { Client, Devis, PrestationDevis } from "@/app/types";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass } from "@/app/components/appCardStyles";
import type { DocumentPdfData } from "@/lib/pdf/documentPdf";
import { downloadDocumentPdf, sendDocumentByEmail } from "@/lib/pdf/documentActions";

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

function buildEmailContent(devis: Devis, company: CompanySettings) {
  const body = [
    "Bonjour,",
    "",
    `Veuillez trouver ci-joint notre proposition commerciale — devis n° ${devis.numeroDevis} en date du ${devis.date}.`,
    `Montant total TTC : ${devis.prix.toLocaleString("fr-FR")} €`,
    devis.validite ? `Validité : ${devis.validite}` : "",
    "",
    "Cordialement,",
    company.denomination,
  ]
    .filter((line) => line !== "")
    .join("\n");
  return { subject: `Devis ${devis.numeroDevis} – ${devis.entreprise}`, body };
}

const toolbarBtn =
  "inline-flex items-center gap-2 rounded-full bg-zinc-100/80 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-50";

type EmailState = "idle" | "sending" | "sent" | "fallback" | "error";

export default function DevisDocument({ devis, client, onClose }: DevisDocumentProps) {
  const [company] = useCompany();
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [pdfBusy, setPdfBusy] = useState(false);
  const lignes =
    devis.prestations && devis.prestations.length > 0
      ? devis.prestations
      : [{ designation: "Prestation", prix: devis.prix, inclusForfait: false }];

  const pdfData: DocumentPdfData = {
    kind: "devis",
    numero: devis.numeroDevis,
    date: devis.date,
    validite: devis.validite,
    entreprise: devis.entreprise,
    clientNom: client?.patron || undefined,
    clientEmail: client?.email || undefined,
    clientTelephone: client?.telephone || undefined,
    lignes: lignes.map((p) => ({
      designation: designationLigneDevis(p) || "Prestation",
      montant: montantLigneDevis(p),
      inclus: estLigneInclusForfait(p),
    })),
    totalLabel: `${devis.prix.toLocaleString("fr-FR")} €`,
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
    const { subject, body } = buildEmailContent(devis, company);
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
        aria-labelledby="devis-preview-title"
      >
        <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
          <h2 id="devis-preview-title" className="text-base font-semibold tracking-tight text-zinc-900">
            Devis {devis.numeroDevis}
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
              Email envoyé avec le devis en pièce jointe.
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
            className="devis-print-area mx-auto rounded-lg bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            style={{ maxWidth: "210mm", minHeight: "297mm" }}
          >
            {/* En-tête */}
            <header className="px-8 pt-12 pb-10 md:px-14 md:pt-16">
              <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-[2rem] font-semibold tracking-tight text-zinc-900">Devis</h1>
                  <dl className="mt-3 space-y-1 text-sm text-zinc-500">
                    <div className="flex gap-2">
                      <dt>N°</dt>
                      <dd className="font-medium tabular-nums text-zinc-900">{devis.numeroDevis}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Date</dt>
                      <dd className="tabular-nums text-zinc-900">{devis.date}</dd>
                    </div>
                    {devis.validite ? (
                      <div className="flex gap-2">
                        <dt>Validité</dt>
                        <dd className="text-zinc-900">{devis.validite}</dd>
                      </div>
                    ) : null}
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

            {/* Client */}
            <section className="px-8 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                <p className="text-xs font-medium text-zinc-400">Adressé à</p>
                <p className="mt-1.5 text-lg font-semibold text-zinc-900">{devis.entreprise}</p>
                <div className="mt-1 space-y-0.5 text-sm text-zinc-500">
                  {client?.patron ? <p>{client.patron}</p> : null}
                  {client?.email ? <p>{client.email}</p> : null}
                  {client?.telephone ? <p>{client.telephone}</p> : null}
                </div>
              </div>
            </section>

            {/* Prestations */}
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
                          {designationLigneDevis(p) || "Prestation"}
                        </td>
                        <td
                          className={`py-4 text-right tabular-nums ${
                            inclus ? "font-normal text-zinc-400" : "font-medium text-zinc-900"
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
            <section className="px-8 py-10 md:px-14">
              <div className="flex justify-end">
                <div className="min-w-[15rem]">
                  <div className="flex items-baseline justify-between gap-8 border-t border-zinc-900 pt-4">
                    <span className="text-sm font-medium text-zinc-500">Total TTC</span>
                    <span className="text-[28px] font-semibold tracking-tight tabular-nums text-zinc-900">
                      {devis.prix.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pied de page */}
            <footer className="mt-auto px-8 pb-12 md:px-14">
              <div className="border-t border-zinc-200 pt-8">
                {devis.validite ? (
                  <p className="mb-8 text-[13px] leading-relaxed text-zinc-500">
                    Ce devis est valable {devis.validite}. Toute commande implique l&apos;acceptation de nos
                    conditions générales de vente.
                  </p>
                ) : (
                  <p className="mb-8 text-[13px] leading-relaxed text-zinc-500">
                    Toute commande implique l&apos;acceptation de nos conditions générales de vente.
                  </p>
                )}
                <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                  <p className="text-[13px] text-zinc-500">
                    Fait à {company.ville || "—"}, le {devis.date}
                  </p>
                  <div className="sm:text-right">
                    <p className="text-xs font-medium text-zinc-400">Bon pour accord</p>
                    <div className="mt-12 w-48 border-b border-zinc-300 sm:ml-auto" aria-hidden />
                    <p className="mt-2 text-xs text-zinc-400">Date et signature du client</p>
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
