"use client";

import { STATS } from "@/lib/landing-data";

export function StatsSection() {
  return (
    <section className="py-14" style={{ backgroundColor: "var(--accent-500)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold text-white mb-1">{stat.value}</div>
              <div className="text-white/80 text-sm font-medium uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
