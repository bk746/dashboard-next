"use client";

import { useCallback, useState } from "react";
import { Delete } from "lucide-react";

type Props = {
  onComplete: (pin: string) => void;
  title: string;
  subtitle?: string;
  /** Plein écran (EntryGate) vs encart Paramètres */
  variant?: "fullscreen" | "embedded";
};

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["empty", "0", "back"],
] as const;

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif]";

/**
 * Pavé type code iPhone — chiffres légers, pastilles, retour.
 */
export default function PinPadScreen({
  onComplete,
  title,
  subtitle,
  variant = "fullscreen",
}: Props) {
  const [digits, setDigits] = useState<string>("");

  const append = useCallback(
    (d: string) => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(8);
        } catch {
          /* ignore */
        }
      }
      setDigits((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + d;
        if (next.length === 4) {
          window.setTimeout(() => onComplete(next), 100);
        }
        return next;
      });
    },
    [onComplete]
  );

  const back = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(5);
      } catch {
        /* ignore */
      }
    }
    setDigits((d) => d.slice(0, -1));
  }, []);

  const embedded = variant === "embedded";
  const keySize = embedded
    ? "h-[58px] w-[58px] sm:h-[64px] sm:w-[64px] text-[28px]"
    : "h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] text-[34px]";

  return (
    <div
      className={`${sf} flex w-full max-w-[340px] flex-col items-center ${embedded ? "gap-9" : "gap-11"}`}
    >
      <div className="max-w-[280px] text-center">
        <h2
          className={`text-balance font-semibold tracking-tight text-white ${
            embedded ? "text-[19px] leading-snug" : "text-[22px] leading-tight sm:text-[24px]"
          }`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`mt-2 text-pretty font-normal text-white/45 ${
              embedded ? "text-[12px] leading-relaxed" : "text-[13px] leading-relaxed sm:text-[14px]"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex gap-5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`rounded-full border transition-all duration-150 ease-out ${
              embedded ? "h-2.5 w-2.5" : "h-3 w-3"
            } ${
              digits.length > i
                ? "scale-100 border-white bg-white"
                : "border-white/35 bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className={`grid w-full ${embedded ? "gap-y-1 gap-x-2" : "gap-y-2 gap-x-1"}`}>
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 place-items-center gap-x-2">
            {row.map((key) => {
              if (key === "empty") {
                return <div key={key} className={embedded ? "h-[58px] sm:h-[64px]" : "h-[72px] sm:h-[80px]"} />;
              }
              if (key === "back") {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={back}
                    className={`flex items-center justify-center rounded-full text-white/55 transition-all duration-150 active:scale-95 active:bg-white/10 ${keySize}`}
                    aria-label="Effacer"
                  >
                    <Delete className="h-[26px] w-[26px] sm:h-7 sm:w-7" strokeWidth={1.15} />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => append(key)}
                  className={`flex items-center justify-center rounded-full font-light text-white transition-all duration-150 select-none active:scale-95 active:bg-white/[0.12] ${keySize}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
