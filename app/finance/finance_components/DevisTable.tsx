"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaFileInvoice, FaEye } from "react-icons/fa";
import type { Devis } from "@/app/types";

interface DevisTableProps {
  devis: Devis[];
  onDelete: (id: string) => void;
  onEdit: (devis: Devis) => void;
  onCreateFacture: (devis: Devis) => void;
  onView: (devis: Devis) => void;
}

export default function DevisTable({ devis, onDelete, onEdit, onCreateFacture, onView }: DevisTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredDevis = devis.filter((d) => {
    const matchSearch = d.numeroDevis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "Tous les statuts" || d.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Accepté": return "bg-green-600 text-white";
      case "Envoyé": return "bg-amber-600 text-white";
      case "Brouillon": return "bg-neutral-600 text-white";
      case "Refusé": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#ED8600] focus:ring-1 focus:ring-[#ED8600]/20 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-8 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:border-[#ED8600] cursor-pointer text-sm"
          >
            <option value="Tous les statuts">Tous les statuts</option>
            <option value="Brouillon">Brouillon</option>
            <option value="Envoyé">Envoyé</option>
            <option value="Accepté">Accepté</option>
            <option value="Refusé">Refusé</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl md:rounded-2xl bg-white overflow-hidden md:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Numéro</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Entreprise</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Date</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Montant</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Aucun devis trouvé</td>
                </tr>
              ) : (
                filteredDevis.map((d) => (
                  <tr key={d.id} className="border-b border-gray-300 hover:bg-gray-200">
                    <td className="p-4 text-gray-500 text-sm">{d.numeroDevis}</td>
                    <td className="p-4 text-gray-500 text-sm">{d.entreprise}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(d.statut)}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{d.date}</td>
                    <td className="p-4 text-gray-500 text-sm">{d.prix.toLocaleString("fr-FR")} €</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onView(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 text-sm hover:bg-gray-200"
                        >
                          <FaEye className="text-xs" /> Voir le devis
                        </button>
                        <button
                          onClick={() => onCreateFacture(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ED8600] rounded-lg text-white text-sm hover:opacity-90"
                        >
                          <FaFileInvoice className="text-xs" /> Créer la facture
                        </button>
                        <button onClick={() => onEdit(d)} className="text-gray-500 hover:text-gray-600 p-2">
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button onClick={() => onDelete(d.id)} className="text-red-500 hover:text-red-600 text-sm">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
