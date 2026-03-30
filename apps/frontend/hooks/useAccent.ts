"use client";

/**
 * Returns inline style objects for accent-colored elements.
 * Uses CSS custom properties set by LandingThemeProvider.
 */
export function useAccent() {
  return {
    // bg accent
    bgAccent: { backgroundColor: "var(--accent-500)" } as React.CSSProperties,
    bgAccentHover: { backgroundColor: "var(--accent-600)" } as React.CSSProperties,
    // text accent
    textAccent: { color: "var(--accent-500)" } as React.CSSProperties,
    // border accent
    borderAccent: { borderColor: "var(--accent-500)" } as React.CSSProperties,
    // bg accent with low opacity (10%)
    bgAccentSubtle: { backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" } as React.CSSProperties,
  };
}
