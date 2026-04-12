"use client";

import { FaTimes, FaPrint, FaEnvelope } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import type { Client, Facture } from "@/app/types";
import { getMontantAcompteFacture, getResteAPayerFacture } from "@/app/finance/utils";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass, overlayDocumentViewerClass, overlayCloseButtonClass } from "@/app/components/appCardStyles";

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

export default function FactureDocument({ facture, client, onClose }: FactureDocumentProps) {
  const [company] = useCompany();
  const mailtoHref = buildFactureMailto(facture, client, company);
  const montantAcompte = getMontantAcompteFacture(facture);
  const resteAPayer = getResteAPayerFacture(facture);
  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayDocumentViewerClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="facture-preview-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-700/80 px-4 py-3 sm:px-5">
          <h2 id="facture-preview-title" className="text-base font-semibold tracking-tight text-zinc-100">
            Aperçu de la facture
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5b7fb8] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4e6fa3]"
            >
              <FaPrint /> <span className="hidden sm:inline">Imprimer ou PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              <FaEnvelope aria-hidden />
              <span className="hidden sm:inline">Envoyer par mail</span>
              <span className="sm:hidden">Mail</span>
            </a>
            <button type="button" onClick={onClose} className={`${overlayCloseButtonClass} text-zinc-400 hover:bg-white/10 hover:text-white`} aria-label="Fermer">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          <div className="facture-print-area bg-white text-black rounded-lg shadow-xl p-8 md:p-10 mx-auto" style={{ maxWidth: "210mm" }}>
            <div className="border-b border-neutral-300 pb-6 mb-6">
              <h1 className="text-xl font-bold text-[#7c3aed] print:text-[#7c3aed]">{company.denomination}</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {company.formeJuridique} – SIRET {company.siret}
              </p>
              <p className="text-sm text-neutral-600">{formatCompanyAddressLine(company)}</p>
              <p className="text-sm text-neutral-600">{company.email} – {company.telephone}</p>
              <p className="text-sm text-neutral-500 mt-1">{company.tva}</p>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">FACTURE</h2>
              <p className="text-neutral-600 mt-1">N° {facture.numeroFacture}</p>
              <p className="text-neutral-600">Date : {facture.date}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase text-neutral-500 mb-2">Client</h3>
              <p className="font-medium text-neutral-900">{facture.entreprise}</p>
              {client?.patron && <p className="text-sm text-neutral-600">{client.patron}</p>}
              {client?.email && <p className="text-sm text-neutral-600">{client.email}</p>}
              {client?.telephone && <p className="text-sm text-neutral-600">{client.telephone}</p>}
            </div>
            <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="text-left p-3 font-semibold text-neutral-700">Désignation</th>
                    <th className="text-right p-3 font-semibold text-neutral-700 w-28">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-neutral-200">
                    <td className="p-3 text-neutral-800">Prestation / Abonnement</td>
                    <td className="p-3 text-right font-medium">{facture.prix.toLocaleString("fr-FR")} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {montantAcompte > 0 ? (
              <div className="mb-4 space-y-1 text-right text-sm text-neutral-700">
                <p>
                  <span className="text-neutral-600">Acompte versé :</span>{" "}
                  <span className="font-medium tabular-nums">− {montantAcompte.toLocaleString("fr-FR")} €</span>
                </p>
                <p>
                  <span className="text-neutral-600">Reste à payer :</span>{" "}
                  <span className="font-semibold tabular-nums text-neutral-900">
                    {resteAPayer.toLocaleString("fr-FR")} €
                  </span>
                </p>
              </div>
            ) : null}
            <div className="flex justify-end mb-6">
              <div className="text-right">
                <span className="text-neutral-600 mr-4">Total TTC :</span>
                <span className="text-lg font-bold">{facture.prix.toLocaleString("fr-FR")} €</span>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500">Statut : <strong>{facture.statut}</strong></p>
              <p className="text-sm text-neutral-500 mt-4">Fait à {company.ville}, le {facture.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
