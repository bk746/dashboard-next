"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartLine } from "react-icons/fa";
import { dashboardCardChart, chartAccentDark } from "@/app/components/appCardStyles";

interface EvolutionCACardProps {
  data: { month: string; revenue: number }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly { value?: number }[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length && payload[0]?.value != null) {
    return (
      <div className="rounded-lg border border-neutral-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-sm px-4 py-3 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{String(label ?? "")}</p>
        <p className="text-lg font-semibold tabular-nums" style={{ color: chartAccentDark }}>
          {Number(payload[0].value).toLocaleString("fr-FR")} €
        </p>
      </div>
    );
  }
  return null;
};

const tickMuted = { fill: "#71717a", fontSize: 11 };

export default function EvolutionCACard({ data }: EvolutionCACardProps) {
  const chartColor = chartAccentDark;
  const gradientId = "revenueGradient-dark";
  const gridStroke = "rgba(255,255,255,0.06)";

  return (
    <div className={dashboardCardChart}>
      <div className="absolute top-3 right-3 w-10 h-10 rounded-lg border border-neutral-200/80 dark:border-white/[0.06] bg-zinc-50/90 dark:bg-zinc-900/80 flex items-center justify-center z-10 hidden md:flex">
        <FaChartLine className="text-[#ED8600]/70 dark:text-[#8fa9c9]/80 text-lg" aria-hidden />
      </div>
      <div className="mb-2 z-10 pr-12 md:pr-0">
        <h3 className="text-[#ED8600] dark:text-[#8fa9c9] text-lg font-semibold mb-1 tracking-tight">Évolution du CA</h3>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-5">
          Encaissements par mois (factures payées), 12 mois glissants.
        </p>
      </div>
      <div className="flex-1 w-full -mt-2 min-h-0 min-h-[240px] sm:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickMuted} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickMuted}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
