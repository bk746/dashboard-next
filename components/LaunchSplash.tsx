"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import AppLaunchSplashOverlay from "@/components/AppLaunchSplash";

const STORAGE_KEY = "bk-copilot-splash-shown";

type Phase = "idle" | "splash" | "exit";

/**
 * Écran d’ouverture premium — une fois par session d’onglet (pages auth).
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

    const id = window.setTimeout(() => setPhase("exit"), 1850);
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

  const overlayPhase = phase === "idle" ? "hidden" : phase;

  return (
    <>
      {children}
      <AppLaunchSplashOverlay phase={overlayPhase} />
    </>
  );
}
