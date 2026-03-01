"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartLine } from "react-icons/fa";

interface EvolutionCACardProps {
  data: { month: string; revenue: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white border border-neutral-300 px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-bold text-[#ED8600]">
          {payload[0].value.toLocaleString("fr-FR")} €
        </p>
      </div>
    );
  }
  return null;
};

export default function EvolutionCACard({ data }: EvolutionCACardProps) {
  return (
    <div className="border border-neutral-300 rounded-xl p-5 bg-linear-to-tr from-[#f6f6f6] via-[#f6f6f6] to-[#ED8600] h-full flex flex-col shadow-2xl shadow-[#0000002b] relative overflow-hidden">
      <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 border border-neutral-300 rounded-lg flex items-center justify-center backdrop-blur-sm z-10">
        <FaChartLine className="text-[#ED8600] text-lg" />
      </div>
      
      <div className="mb-2 z-10">
        <h3 className="text-[#ED8600] text-lg font-bold mb-1">Évolution du CA</h3>
        <p className="text-gray-500 text-sm mb-5">Chiffre d'affaires mensuel sur l'année</p>
      </div>
      
      <div className="flex-1 w-full -mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ED8600" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ED8600" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(0, 0, 0, 0.08)" 
              vertical={false} 
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "rgb(107, 114, 128)", fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "rgb(107, 114, 128)", fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ED8600"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
