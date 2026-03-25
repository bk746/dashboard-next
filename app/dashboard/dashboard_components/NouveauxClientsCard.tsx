"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaUserClock } from "react-icons/fa";
import { dashboardCardChart, chartAccentDark } from "@/app/components/appCardStyles";

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
      <div className="rounded-lg border border-neutral-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-sm px-4 py-3 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5 tabular-nums">
          {n} client{n !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Dernière activité dans ce mois</p>
      </div>
    );
  }
  return null;
};

const tickMuted = { fill: "#71717a", fontSize: 11 };

export default function NouveauxClientsCard({ data }: NouveauxClientsCardProps) {
  const chartColor = chartAccentDark;
  const gridStroke = "rgba(255,255,255,0.06)";

  return (
    <div className={dashboardCardChart}>
      <div className="absolute top-3 right-3 w-10 h-10 rounded-lg border border-neutral-200/80 dark:border-white/[0.06] bg-zinc-50/90 dark:bg-zinc-900/80 flex items-center justify-center z-10 hidden md:flex">
        <FaUserClock className="text-[#ED8600]/70 dark:text-[#8fa9c9]/80 text-lg" aria-hidden />
      </div>
      <div className="mb-2 z-10 pr-12 md:pr-0">
        <h3 className="text-[#ED8600] dark:text-[#8fa9c9] text-lg font-semibold mb-1 tracking-tight">Activité clients</h3>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-5">
          Nombre de clients dont le champ « dernière activité » tombe dans chaque mois (12 mois glissants).
        </p>
      </div>
      <div className="flex-1 w-full -mt-2 min-h-0 min-h-[220px] sm:min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickMuted} />
            <YAxis axisLine={false} tickLine={false} tick={tickMuted} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="clients" fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
