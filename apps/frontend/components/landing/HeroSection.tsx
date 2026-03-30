"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    tag: "Quality Parts for Every Ride",
    title: "Reliable Auto Parts\nDelivered Fast",
    description:
      "From engine components to braking systems, we offer top-notch parts that meet the highest standards of quality and durability.",
    cta: { label: "Explore Products", href: "/#products" },
    ctaSecondary: { label: "Our Services", href: "/#services" },
  },
  {
    tag: "Trusted by 50,000+ Customers",
    title: "Premium Parts\nAt Your Doorstep",
    description:
      "We stock over 50,000 genuine and aftermarket parts from 120+ trusted brands. Find exactly what your vehicle needs.",
    cta: { label: "Shop Now", href: "/#products" },
    ctaSecondary: { label: "Learn More", href: "/#about" },
  },
  {
    tag: "15+ Years of Excellence",
    title: "Expert Support\nFor Every Build",
    description:
      "Our team of automotive specialists is ready to help you find the right part, every time. 24/7 customer support available.",
    cta: { label: "Contact Us", href: "/#contact" },
    ctaSecondary: { label: "About Us", href: "/#about" },
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section className="relative bg-[#0d0d0d] text-white overflow-hidden min-h-[600px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Orange accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--accent-500)" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--accent-500)" }}>
            {slide.tag}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl">
            {slide.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={slide.cta.href}
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded transition"
              style={{ backgroundColor: "var(--accent-500)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-600)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-500)")}
            >
              {slide.cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={slide.ctaSecondary.href}
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-7 py-3 rounded transition hover:border-white/60"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Slider controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-500">
          {current + 1} / {SLIDES.length}
        </span>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === current ? "w-8" : "w-3 bg-white/30"
            }`}
            style={i === current ? { backgroundColor: "var(--accent-500)", width: "2rem" } : {}}
          />
        ))}
      </div>
    </section>
  );
}
