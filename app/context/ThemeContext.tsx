"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

/** Thème unique : sombre sur tout le site (plus de bascule clair / sombre). */
interface ThemeContextType {
  theme: "dark";
  isDark: true;
  setTheme: (_t: "dark") => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: "dark",
      isDark: true,
      setTheme: () => {
        document.documentElement.classList.add("dark");
      },
      toggleTheme: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
