"use client";

import { TESTIMONIALS } from "@/lib/landing-data";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-500)" }}>
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            What Our Customers Say
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 rounded" style={{ backgroundColor: "var(--accent-500)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t._id}
              className="bg-[#1a1a1a] border border-white/5 rounded-lg p-8 relative"
            >
              <Quote className="h-8 w-8 mb-4 opacity-30" style={{ color: "var(--accent-500)" }} />
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-500) 20%, transparent)",
                    color: "var(--accent-500)",
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
