"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartLine } from "react-icons/fa";

interface EvolutionCACardProps {
  data: { month: string; revenue: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-base font-semibold text-gray-900 tabular-nums">
          {payload[0].value.toLocaleString("fr-FR")} €
        </p>
      </div>
    );
  }
  return null;
};

export default function EvolutionCACard({ data }: EvolutionCACardProps) {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Évolution du CA</p>
          <p className="mt-0.5 text-xs text-gray-400">Chiffre d'affaires mensuel</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
          <FaChartLine className="h-4 w-4 text-orange-500" />
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
