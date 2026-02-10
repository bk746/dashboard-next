"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";

interface Facture {
  id: string;
  numeroFacture: string;
  entreprise: string;
  statut: "Payé" | "Non payé";
  date: string;
  prix: number;
  abonnement: "Actif" | "Inactif";
}

interface FacturesTableProps {
  factures: Facture[];
  onDelete: (id: string) => void;
  onEdit: (facture: Facture) => void;
}

export default function FacturesTable({ factures, onDelete, onEdit }: FacturesTableProps) {
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
    <div className="px-4 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10">
      {/* Barre de recherche et filtre */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm" />
          <input
            type="text"
            placeholder="🔍 Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#1A10AC]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC] cursor-pointer"
          >
            <option value="Tous les statuts">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Non payé">Non payé</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="border border-neutral-700 rounded-xl bg-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Numéro de facture</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Entreprise</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Statut</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Date</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Prix</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Abonnement</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFactures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredFactures.map((facture) => (
                  <tr key={facture.id} className="border-b border-neutral-700 hover:bg-neutral-900 transition-colors">
                    <td className="p-4">
                      <span className="text-white text-sm">{facture.numeroFacture}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">{facture.entreprise}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(facture.statut)}`}>
                          {facture.statut}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-400 text-sm">{facture.date}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">{facture.prix.toLocaleString("fr-FR")} €</span>
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
                          onClick={() => onEdit(facture)}
                          className="text-neutral-400 hover:text-white transition-colors p-2"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete(facture.id)}
                          className="text-red-500 hover:text-red-600 transition-colors text-sm"
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
