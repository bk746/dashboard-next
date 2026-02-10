"use client";

import { useState } from "react";
import { FaEnvelope, FaEllipsisV, FaSearch, FaChevronDown } from "react-icons/fa";
import type { Client } from "@/app/clients/types";

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
}

export default function ClientsTable({ clients, onDelete, onEdit }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous les statuts");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.patron.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous les statuts" || client.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Actif":
        return "bg-green-600 text-white";
      case "Inactif":
        return "bg-gray-600 text-white";
      case "Prospect":
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getAbonnementBadgeColor = (abonnement?: string) => {
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
            placeholder="🔍 Rechercher un client..."
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
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="Prospect">Prospect</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="border border-neutral-700 rounded-xl bg-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Client</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Contact</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Statut</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">CA Total</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Abonnement</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold">Dernière activité</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-neutral-700 hover:bg-neutral-900 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A10AC] flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(client.entreprise)}
                      </div>
                      <span className="text-white text-sm">{client.entreprise}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-white text-sm">{client.patron}</span>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-neutral-400 text-xs" />
                        <span className="text-neutral-400 text-xs">{client.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(client.statut)}`}>
                        {client.statut}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white text-sm">{client.caTotal.toLocaleString("fr-FR")} €</span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getAbonnementBadgeColor(client.abonnement)}`}>
                        {client.abonnement || "Inactif"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-neutral-400 text-sm">{client.derniereActivite}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(client)}
                        className="text-neutral-400 hover:text-white transition-colors p-2"
                      >
                        <FaEllipsisV className="text-sm" />
                      </button>
                      <button
                        onClick={() => onDelete(client.id)}
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
