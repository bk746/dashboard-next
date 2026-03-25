"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "bk-copilot-splash-shown";

type Phase = "idle" | "splash" | "exit";

/**
 * Fond noir + « bk copilot » — une fois par session d’onglet.
 */
export default function LaunchSplash({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("splash");

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        setPhase("idle");
        return;
      }
    } catch {
      setPhase("idle");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("idle");
      return;
    }

    const showMs = 2000;
    const id = window.setTimeout(() => setPhase("exit"), showMs);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("idle");
    }, 520);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <>
      {children}
      {(phase === "splash" || phase === "exit") && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
            phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={phase === "exit"}
        >
          <p className="px-6 text-center text-lg font-medium tracking-tight text-white">bk copilot</p>
        </div>
      )}
    </>
  );
}
