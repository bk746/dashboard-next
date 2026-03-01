"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaUserPlus } from "react-icons/fa";

interface NouveauxClientsCardProps {
  data: { month: string; clients: number }[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    const n = payload[0].value;
    return (
      <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-neutral-300 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5 tabular-nums">
          {n} nouveau{n !== 1 ? "x" : ""} client{n !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function NouveauxClientsCard({ data }: NouveauxClientsCardProps) {
  return (
    <div className="h-full rounded-2xl md:rounded-xl p-6 md:p-5 flex flex-col overflow-hidden relative transition-all duration-300 ease-out bg-white md:bg-gradient-to-tl md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] border border-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl md:shadow-[#0000002b] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)] md:hover:shadow-2xl md:hover:shadow-[#0000002b] hover:scale-[1.01] md:hover:scale-[1.03]">
      <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 border border-neutral-300 rounded-lg flex items-center justify-center backdrop-blur-sm z-10 hidden md:flex">
        <FaUserPlus className="text-[#ED8600] text-lg" />
      </div>
      <div className="mb-2 z-10">
        <h3 className="text-[#ED8600] text-lg font-bold mb-1">Nouveaux clients</h3>
        <p className="text-gray-500 text-sm mb-5">Acquisition mensuelle sur les 12 derniers mois</p>
      </div>
      <div className="flex-1 w-full -mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="clients" fill="#ED8600" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
