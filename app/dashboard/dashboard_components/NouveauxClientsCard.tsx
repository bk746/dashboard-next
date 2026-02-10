"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaUsers } from "react-icons/fa";

interface NouveauxClientsCardProps {
  data: { month: string; clients: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-gray-900 border border-neutral-700 px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-lg font-bold text-[#1A10AC]">
          {payload[0].value} nouveau{payload[0].value > 1 ? "x" : ""} client{payload[0].value > 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function NouveauxClientsCard({ data }: NouveauxClientsCardProps) {
  return (
    <div className="border border-neutral-700 rounded-xl p-5 bg-linear-to-tl from-balck via-black to-[#1A10AC] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-3 right-3 w-10 h-10 bg-gray-900/50 border border-neutral-700 rounded-lg flex items-center justify-center backdrop-blur-sm z-10">
        <FaUsers className="text-white text-lg" />
      </div>
      
      <div className="mb-2 z-10">
        <h3 className="text-white text-lg font-semibold mb-1">Nouveaux clients</h3>
        <p className="text-neutral-400 text-sm mb-5">Acquisition mensuelle</p>
      </div>
      
      <div className="flex-1 w-full -mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)" 
              vertical={false} 
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="clients"
              fill="#1A10AC"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
