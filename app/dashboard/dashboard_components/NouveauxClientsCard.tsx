"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

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
      <div className="rounded-2xl border-0 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm dark:bg-[#12131a]/95 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {n} client{n !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const tickMuted = { fill: "#a1a1aa", fontSize: 11 };

export default function NouveauxClientsCard({ data }: NouveauxClientsCardProps) {
  const total = data.reduce((s, d) => s + (d.clients || 0), 0);
  const avg = data.length > 0 ? total / data.length : 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.10)] dark:bg-[#12131a] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
            <Activity className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[17px]">
              Activité clients
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Dernière activité, 12 mois glissants</p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Moyenne
          </p>
          <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {avg.toFixed(1)}<span className="text-xs text-zinc-500 dark:text-zinc-400"> /mois</span>
          </p>
        </div>
      </div>

      <div className="min-h-[220px] w-full flex-1 sm:min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }} barCategoryGap="22%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7aa3d6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6b8fc7" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickMuted} />
            <YAxis axisLine={false} tickLine={false} tick={tickMuted} width={32} allowDecimals={false} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(107,143,199,0.08)" }}
            />
            <Bar dataKey="clients" radius={[10, 10, 0, 0]} fill="url(#barGradient)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
