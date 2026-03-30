"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME, type ThemeKey } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function LandingThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  // Apply CSS vars to :root
  function applyTheme(key: ThemeKey) {
    const found = THEMES.find((t) => t.key === key);
    if (!found) return;
    const root = document.documentElement;
    Object.entries(found.vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
  }

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("landing-theme") as ThemeKey | null;
    const initial = stored && THEMES.find((t) => t.key === stored) ? stored : DEFAULT_THEME;
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function setTheme(key: ThemeKey) {
    setThemeState(key);
    applyTheme(key);
    localStorage.setItem("landing-theme", key);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useLandingTheme() {
  return useContext(ThemeContext);
}
