"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart } from "lucide-react";

interface EvolutionCACardProps {
  data: { month: string; revenue: number }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly { value?: number }[];
  label?: string | number;
}

const LINE_COLOR = "#FF8FA8";
const GRADIENT_ID = "evCAgradientViolet";

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length && payload[0]?.value != null) {
    return (
      <div className="rounded-2xl border-0 bg-[#3d3568]/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
          {String(label ?? "")}
        </p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-white">
          {Number(payload[0].value).toLocaleString("fr-FR")} €
        </p>
      </div>
    );
  }
  return null;
};

const tickLight = { fill: "rgba(255,255,255,0.72)", fontSize: 11 };

export default function EvolutionCACard({ data }: EvolutionCACardProps) {
  const total = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const max = data.reduce((m, d) => (d.revenue > m ? d.revenue : m), 0);
  const maxMonth = max > 0 ? data.find((d) => d.revenue === max)?.month ?? null : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#6C5DD3] via-[#5E549E] to-[#4a4088] p-5 shadow-[0_12px_40px_-12px_rgba(108,93,211,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-12px_rgba(108,93,211,0.65)] md:p-6">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#FF8FA8]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white shadow-sm backdrop-blur-sm">
            <LineChart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-white md:text-[17px]">
              Évolution du CA
            </h3>
            <p className="text-xs text-white/65">12 mois glissants — factures payées</p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Total</p>
          <p className="text-sm font-semibold tabular-nums text-white">
            {total.toLocaleString("fr-FR")} €
          </p>
          {maxMonth ? (
            <p className="mt-0.5 text-[11px] text-white/60">pic en {maxMonth}</p>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-[240px] w-full flex-1 rounded-2xl bg-white/[0.06] p-2 backdrop-blur-[2px] sm:min-h-[300px] sm:p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.45} />
                <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.14)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickLight} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickLight}
              width={42}
              tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`)}
            />
            <Tooltip
              content={(props) => <CustomTooltip {...props} />}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={LINE_COLOR}
              strokeWidth={2.5}
              fill={`url(#${GRADIENT_ID})`}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: LINE_COLOR }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
