"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartLine } from "react-icons/fa";
import { useTheme } from "@/app/context/ThemeContext";

interface EvolutionCACardProps {
  data: { month: string; revenue: number }[];
}

const CustomTooltip = ({ active, payload, label, isDark }: { active?: boolean; payload?: { value: number }[]; label?: string; isDark?: boolean }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-gray-700 px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-lg font-bold ${isDark ? "text-green-500" : "text-[#ED8600]"}`}>{payload[0].value.toLocaleString("fr-FR")} €</p>
      </div>
    );
  }
  return null;
};

export default function EvolutionCACard({ data }: EvolutionCACardProps) {
  const { isDark } = useTheme();
  const chartColor = isDark ? "#22c55e" : "#ED8600";
  const gradientId = `revenueGradient-${isDark ? "dark" : "light"}`;

  return (
    <div className="h-full rounded-2xl md:rounded-xl p-6 md:p-5 flex flex-col overflow-hidden relative transition-all duration-300 ease-out bg-white dark:bg-black md:bg-gradient-to-tr md:from-[#f6f6f6] md:via-[#f6f6f6] md:to-[#ED8600] dark:md:from-black dark:md:via-black dark:md:to-blue-800 border border-neutral-300 dark:border-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl dark:md:shadow-none hover:scale-[1.01] md:hover:scale-[1.03]">
      <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 dark:bg-black/80 border border-neutral-300 dark:border-gray-700 rounded-lg flex items-center justify-center backdrop-blur-sm z-10 hidden md:flex">
        <FaChartLine className="text-[#ED8600] dark:text-blue-800 text-lg" />
      </div>
      <div className="mb-2 z-10">
        <h3 className="text-[#ED8600] dark:text-blue-800 text-lg font-bold mb-1">Évolution du CA</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Chiffre d'affaires mensuel sur l'année</p>
      </div>
      <div className="flex-1 w-full -mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgb(107,114,128)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgb(107,114,128)", fontSize: 11 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
            <Area type="monotone" dataKey="revenue" stroke={chartColor} strokeWidth={2} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
