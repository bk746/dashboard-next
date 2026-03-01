"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import type { Projet } from "@/app/types";

interface ProjetsTableProps {
  projets: Projet[];
  onDelete: (id: string) => void;
  onEdit: (projet: Projet) => void;
}

export default function ProjetsTable({ projets, onDelete, onEdit }: ProjetsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredProjets = projets.filter((projet) => {
    const matchesSearch =
      projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous les statuts" || projet.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Actif":
        return "bg-green-600 text-white";
      case "Prospect":
        return "bg-orange-600 text-white";
      case "Terminé":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 md:pb-10">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="🔍 Rechercher un projet..."
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
            <option value="Actif">Actif</option>
            <option value="Prospect">Prospect</option>
            <option value="Terminé">Terminé</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl md:rounded-2xl bg-white overflow-hidden md:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Nom du projet</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Entreprise</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Valeur</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Date début</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Date fin</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Responsable</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold">Commentaire</th>
                <th className="text-left p-4 text-gray-500 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                filteredProjets.map((projet) => (
                  <tr key={projet.id} className="border-b border-gray-300 hover:bg-gray-200 transition-colors">
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.nom}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.entreprise}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(projet.statut)}`}>
                          {projet.statut}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.valeur.toLocaleString("fr-FR")} €</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.dateDebut}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.dateFin}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm">{projet.responsable}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-sm max-w-xs truncate block" title={projet.commentaire || ""}>
                        {projet.commentaire || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(projet)}
                          className="text-gray-500 hover:text-gray-600 transition-colors p-2"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete(projet.id)}
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
