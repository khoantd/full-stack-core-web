"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { LandingConfig } from "@/services/landing.service";

const FEATURES = [
  "Genuine OEM and aftermarket parts",
  "Fast nationwide shipping",
  "Expert technical support",
  "30-day hassle-free returns",
  "Competitive wholesale pricing",
  "Trusted by 50,000+ customers",
];

interface Props {
  config?: LandingConfig;
}

export function AboutSection({ config }: Props) {
  const siteName = config?.siteName || "Car Parts";
  return (
    <section id="about" className="py-20 bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: visual */}
          <div className="relative">
            <div className="bg-[#1a1a1a] rounded-lg aspect-video flex items-center justify-center border border-white/5">
              <div className="text-center">
                <div className="text-8xl mb-4">🚗</div>
                <p className="text-gray-500 text-sm">Quality Parts Since 2009</p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 text-white rounded-lg p-5 shadow-xl" style={{ backgroundColor: "var(--accent-500)" }}>
              <div className="text-3xl font-extrabold">15+</div>
              <div className="text-xs font-medium uppercase tracking-wide">Years of Trust</div>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
              About Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              Your Trusted Source for Quality Auto Parts
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              With over 15 years in the industry, {siteName} has built a reputation for delivering
              genuine and high-quality aftermarket components. We serve individual car owners,
              mechanics, and fleet managers across the country.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Our extensive catalog covers everything from engine internals to exterior accessories,
              backed by expert support and fast delivery.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded transition"
              style={{ backgroundColor: "var(--accent-500)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-600)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-500)")}
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
