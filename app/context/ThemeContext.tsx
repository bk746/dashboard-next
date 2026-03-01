"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "theme";
type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, mounted]);

  const setTheme = (value: Theme) => {
    setThemeState(value);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (value === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {}
    }
  };

  const toggleTheme = () => {
    setThemeState((t) => {
      const next = t === "light" ? "dark" : "light";
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (next === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
