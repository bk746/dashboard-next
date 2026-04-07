"use client";

import { FaTimes, FaPrint, FaEnvelope } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import { DEVIS_INCLUS_PREFIX } from "@/app/estimation/estimation_utils";
import type { Client, Devis, PrestationDevis } from "@/app/types";
import { formatCompanyAddressLine, type CompanySettings } from "@/app/config/company";
import { overlayBackdropClass, overlayDocumentViewerClass, overlayCloseButtonClass } from "@/app/components/appCardStyles";

function estLigneInclusForfait(p: PrestationDevis): boolean {
  if (p.inclusForfait) return true;
  return p.prix === 0 && p.designation.startsWith(DEVIS_INCLUS_PREFIX);
}

/** Anciennes lignes enregistrées avec le préfixe « Inclus — » : n’afficher que le libellé. */
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

export default function DevisDocument({ devis, client, onClose }: DevisDocumentProps) {
  const [company] = useCompany();
  const mailtoHref = buildDevisMailto(devis, client, company);
  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayDocumentViewerClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="devis-preview-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-700/80 px-4 py-3 sm:px-5">
          <h2 id="devis-preview-title" className="text-base font-semibold tracking-tight text-zinc-100">
            Aperçu du devis
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
          <div className="devis-print-area bg-white text-black rounded-lg shadow-xl p-8 md:p-10 mx-auto" style={{ maxWidth: "210mm" }}>
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
              <h2 className="text-2xl font-bold text-neutral-900">DEVIS</h2>
              <p className="text-neutral-600 mt-1">N° {devis.numeroDevis}</p>
              <p className="text-neutral-600">Date : {devis.date}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase text-neutral-500 mb-2">Client</h3>
              <p className="font-medium text-neutral-900">{devis.entreprise}</p>
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
                  {devis.prestations && devis.prestations.length > 0 ? (
                    devis.prestations.map((p, i) => (
                      <tr key={i} className="border-t border-neutral-200">
                        <td
                          className={`p-3 text-neutral-800 ${estLigneInclusForfait(p) ? "pl-5 text-neutral-600" : ""}`}
                        >
                          {designationLigneDevis(p) || "Prestation"}
                        </td>
                        <td className="p-3 text-right font-medium">{montantLigneDevis(p)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-neutral-200">
                      <td className="p-3 text-neutral-800">Prestation</td>
                      <td className="p-3 text-right font-medium">{devis.prix.toLocaleString("fr-FR")} €</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mb-6">
              <div className="text-right">
                <span className="text-neutral-600 mr-4">Total TTC :</span>
                <span className="text-lg font-bold">{devis.prix.toLocaleString("fr-FR")} €</span>
              </div>
            </div>
            {devis.validite && (
              <p className="text-sm text-neutral-600 mb-6"><strong>Validité du devis :</strong> {devis.validite}</p>
            )}
            <div className="mt-10 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500">Fait à {company.ville}, le {devis.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
