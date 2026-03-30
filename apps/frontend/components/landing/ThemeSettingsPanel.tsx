"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, X, Check } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { useLandingTheme } from "@/context/ThemeContext";

export function ThemeSettingsPanel() {
  const { theme, setTheme } = useLandingTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme settings"
        aria-expanded={open}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-200 cursor-pointer"
      >
        <Palette className="h-4 w-4" />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Theme color settings"
          className="absolute right-0 top-12 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-semibold">Color Theme</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close theme settings"
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Color swatches */}
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const active = theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  aria-label={`${t.label} theme`}
                  aria-pressed={active}
                  className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-white/40 bg-white/10"
                      : "border-transparent hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {/* Swatch */}
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: t.accent }}
                  >
                    {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-gray-600 text-center">
            Preference saved automatically
          </p>
        </div>
      )}
    </div>
  );
}
