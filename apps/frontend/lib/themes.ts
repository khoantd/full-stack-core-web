export type ThemeKey = "orange" | "blue" | "green" | "red" | "purple" | "teal" | "navy";

export interface Theme {
  key: ThemeKey;
  label: string;
  accent: string;       // CSS hex for preview swatch
  accentHover: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    key: "orange",
    label: "Orange",
    accent: "#f97316",
    accentHover: "#ea6c0a",
    vars: {
      "--accent-500": "#f97316",
      "--accent-600": "#ea6c0a",
      "--accent-400": "#fb923c",
    },
  },
  {
    key: "blue",
    label: "Blue",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    vars: {
      "--accent-500": "#3b82f6",
      "--accent-600": "#2563eb",
      "--accent-400": "#60a5fa",
    },
  },
  {
    key: "green",
    label: "Green",
    accent: "#22c55e",
    accentHover: "#16a34a",
    vars: {
      "--accent-500": "#22c55e",
      "--accent-600": "#16a34a",
      "--accent-400": "#4ade80",
    },
  },
  {
    key: "red",
    label: "Red",
    accent: "#ef4444",
    accentHover: "#dc2626",
    vars: {
      "--accent-500": "#ef4444",
      "--accent-600": "#dc2626",
      "--accent-400": "#f87171",
    },
  },
  {
    key: "purple",
    label: "Purple",
    accent: "#a855f7",
    accentHover: "#9333ea",
    vars: {
      "--accent-500": "#a855f7",
      "--accent-600": "#9333ea",
      "--accent-400": "#c084fc",
    },
  },
  {
    key: "teal",
    label: "Teal",
    accent: "#14b8a6",
    accentHover: "#0d9488",
    vars: {
      "--accent-500": "#14b8a6",
      "--accent-600": "#0d9488",
      "--accent-400": "#2dd4bf",
    },
  },
  {
    key: "navy",
    label: "Navy",
    accent: "#1a3a6b",
    accentHover: "#122d57",
    vars: {
      "--accent-500": "#1a3a6b",
      "--accent-600": "#122d57",
      "--accent-400": "#2a5298",
    },
  },
];

export const DEFAULT_THEME: ThemeKey = "orange";
