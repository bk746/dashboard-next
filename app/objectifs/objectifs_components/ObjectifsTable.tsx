"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";

interface Objectif {
  id: string;
  type: "Financier" | "Client";
  libelle: string;
  objectif: number;
  dateDebut: string;
  dateFin: string;
}

interface ObjectifsTableProps {
  objectifs: Objectif[];
  onDelete: (id: string) => void;
  onEdit: (objectif: Objectif) => void;
}

export default function ObjectifsTable({ objectifs, onDelete, onEdit }: ObjectifsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous les types");

  const filteredObjectifs = objectifs.filter((objectif) => {
    const matchesSearch =
      objectif.libelle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Tous les types" || objectif.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Financier":
        return "bg-green-600 text-white";
      case "Client":
        return "bg-blue-600 text-white";
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
            placeholder="🔍 Rechercher un objectif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#1A10AC]"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#1A10AC] cursor-pointer"
          >
            <option value="Tous les types">Tous les types</option>
            <option value="Financier">Financier</option>
            <option value="Client">Client</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="border border-neutral-700 rounded-xl bg-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Libellé</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Type</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Objectif</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Date début</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Date fin</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredObjectifs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    Aucun objectif trouvé
                  </td>
                </tr>
              ) : (
                filteredObjectifs.map((objectif) => (
                  <tr key={objectif.id} className="border-b border-neutral-700 hover:bg-neutral-900 transition-colors">
                    <td className="p-4">
                      <span className="text-white text-sm">{objectif.libelle}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(objectif.type)}`}>
                          {objectif.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">
                        {objectif.objectif.toLocaleString("fr-FR")} {objectif.type === "Financier" ? "€" : ""}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-400 text-sm">{objectif.dateDebut}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-400 text-sm">{objectif.dateFin}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(objectif)}
                          className="text-neutral-400 hover:text-white transition-colors p-2"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete(objectif.id)}
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
