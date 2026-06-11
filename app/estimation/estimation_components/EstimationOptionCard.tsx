"use client";

import type { EstimationItem } from "@/app/config/estimationTarifs";
import { estimationLightInput, estimationOptionCardClass } from "@/app/estimation/estimationUi";

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface EstimationOptionCardProps {
  item: EstimationItem;
  selected: boolean;
  priceLabel: string;
  qty: number;
  rangeValue: number;
  onToggle: () => void;
  onQtyChange: (value: number) => void;
  onRangeChange: (value: number) => void;
}

export function EstimationOptionCard({
  item,
  selected,
  priceLabel,
  qty,
  rangeValue,
  onToggle,
  onQtyChange,
  onRangeChange,
}: EstimationOptionCardProps) {
  if (item.kind === "included") {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50/50 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-800">{item.label}</p>
            {item.description ? (
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{item.description}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
            {item.note ?? "Inclus"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={estimationOptionCardClass(selected)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
          {item.description ? (
            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{item.description}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${
            priceLabel === "inclus" ? "text-emerald-700" : "text-[#007AFF]"
          }`}
        >
          {priceLabel === "inclus" ? "Inclus" : priceLabel}
        </span>
      </div>

      {selected && item.kind === "perUnit" ? (
        <div
          className="mt-3 flex items-center gap-2 border-t border-zinc-200/60 pt-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <label className="text-xs text-zinc-500" htmlFor={`qty-${item.id}`}>
            Qté ({item.unitLabel ?? "unité"})
          </label>
          <input
            id={`qty-${item.id}`}
            type="number"
            min={item.minQty ?? 0}
            max={item.maxQty ?? 9999}
            className={`${estimationLightInput} w-20 py-1.5 text-sm tabular-nums`}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              onQtyChange(Number.isFinite(v) ? v : 0);
            }}
          />
        </div>
      ) : null}

      {selected && item.kind === "range" && item.priceMin != null && item.priceMax != null ? (
        <div
          className="mt-3 space-y-2 border-t border-zinc-200/60 pt-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <div className="flex justify-between text-xs text-zinc-500 tabular-nums">
            <span>{eur.format(item.priceMin)}</span>
            <span className="font-medium text-zinc-800">{eur.format(rangeValue)}</span>
            <span>{eur.format(item.priceMax)}</span>
          </div>
          <input
            type="range"
            min={item.priceMin}
            max={item.priceMax}
            step={Math.max(50, Math.round((item.priceMax - item.priceMin) / 40))}
            className="w-full accent-[#007AFF]"
            value={rangeValue}
            onChange={(e) => onRangeChange(parseInt(e.target.value, 10))}
          />
        </div>
      ) : null}
    </button>
  );
}

interface MaintenanceOptionCardProps {
  label: string;
  description?: string;
  priceLabel: string;
  selected: boolean;
  onSelect: () => void;
}

export function MaintenanceOptionCard({
  label,
  description,
  priceLabel,
  selected,
  onSelect,
}: MaintenanceOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={estimationOptionCardClass(selected)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{label}</p>
          {description ? <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{description}</p> : null}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-[#007AFF]">{priceLabel}</span>
      </div>
    </button>
  );
}
