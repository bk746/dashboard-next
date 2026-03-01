"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV, FaEye } from "react-icons/fa";
import type { Facture } from "@/app/types";

interface FacturesTableProps {
  factures: Facture[];
  onDelete: (id: string) => void;
  onEdit: (facture: Facture) => void;
  onView: (facture: Facture) => void;
}

export default function FacturesTable({ factures, onDelete, onEdit, onView }: FacturesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredFactures = factures.filter((facture) => {
    const matchesSearch =
      facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous les statuts" || facture.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Payé":
        return "bg-green-600 text-white";
      case "Non payé":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getAbonnementBadgeColor = (abonnement: string) => {
    switch (abonnement) {
      case "Actif":
        return "bg-green-600 text-white";
      case "Inactif":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      {/* Barre de recherche et filtre */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="🔍 Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800 focus:ring-1 focus:ring-[#ED8600]/20 dark:focus:ring-blue-800/20 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 focus:outline-none focus:border-[#ED8600] dark:focus:border-blue-800 cursor-pointer text-sm"
          >
            <option value="Tous les statuts">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Non payé">Non payé</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl bg-white dark:bg-black overflow-hidden md:shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:md:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Numéro de facture</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Entreprise</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Date</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Prix</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">Abonnement</th>
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFactures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredFactures.map((facture) => (
                  <tr key={facture.id} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{facture.numeroFacture}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{facture.entreprise}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(facture.statut)}`}>
                          {facture.statut}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{facture.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{facture.prix.toLocaleString("fr-FR")} €</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getAbonnementBadgeColor(facture.abonnement)}`}>
                          {facture.abonnement}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(facture)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <FaEye className="text-xs" /> Voir
                        </button>
                        <button
                          onClick={() => onEdit(facture)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete(facture.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm"
                        >
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
