"use client";

import { FaTimes, FaPrint } from "react-icons/fa";
import { useCompany } from "@/app/hooks/useCompany";
import type { Client, Facture } from "@/app/types";

interface FactureDocumentProps {
  facture: Facture;
  client?: Client | null;
  onClose: () => void;
}

export default function FactureDocument({ facture, client, onClose }: FactureDocumentProps) {
  const [company] = useCompany();
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4 no-print">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-3xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-white text-lg font-bold">Aperçu de la facture</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A10AC] rounded-lg text-white hover:bg-[#1a0fc0] text-sm"
            >
              <FaPrint /> Imprimer ou enregistrer en PDF
            </button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          <div className="facture-print-area bg-white text-black rounded-lg shadow-xl p-8 md:p-10 mx-auto" style={{ maxWidth: "210mm" }}>
            <div className="border-b border-neutral-300 pb-6 mb-6">
              <h1 className="text-xl font-bold text-[#1A10AC]">{company.denomination}</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {company.formeJuridique} – SIRET {company.siret}
              </p>
              <p className="text-sm text-neutral-600">
                {company.adresse}, {company.codePostal} {company.ville} – {company.pays}
              </p>
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
