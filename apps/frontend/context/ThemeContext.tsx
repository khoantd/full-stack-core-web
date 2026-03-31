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

export function LandingThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string;
}) {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  function applyTheme(key: ThemeKey) {
    const found = THEMES.find((t) => t.key === key);
    if (!found) return;
    const root = document.documentElement;
    Object.entries(found.vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
  }

  useEffect(() => {
    // Server-provided theme always wins; localStorage is only a fallback when no server theme is set
    const serverTheme = initialTheme && THEMES.find((t) => t.key === initialTheme)
      ? (initialTheme as ThemeKey)
      : null;
    const stored = !serverTheme
      ? (localStorage.getItem("landing-theme") as ThemeKey | null)
      : null;
    const initial = serverTheme ?? (stored && THEMES.find((t) => t.key === stored) ? stored : DEFAULT_THEME);
    setThemeState(initial);
    applyTheme(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTheme]);

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
