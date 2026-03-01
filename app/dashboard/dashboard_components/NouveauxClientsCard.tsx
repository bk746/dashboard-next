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
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-base font-semibold text-gray-900 tabular-nums">
          {n} nouveau{n !== 1 ? "x" : ""} client{n !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function NouveauxClientsCard({ data }: NouveauxClientsCardProps) {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Nouveaux clients</p>
          <p className="mt-0.5 text-xs text-gray-400">Acquisition sur 12 mois</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
          <FaUserPlus className="h-4 w-4 text-orange-500" />
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="clients" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
