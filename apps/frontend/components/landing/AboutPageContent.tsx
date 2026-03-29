"use client";

import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Shield,
  Truck,
  Headphones,
  Award,
  Users,
  ChevronRight,
} from "lucide-react";

const STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "50K+", label: "Parts in Stock" },
  { value: "120+", label: "Trusted Brands" },
  { value: "98%", label: "Customer Satisfaction" },
];

const WHY_US = [
  {
    icon: Shield,
    title: "Genuine Quality",
    desc: "Every part is sourced from verified manufacturers and meets OEM or higher standards.",
  },
  {
    icon: Truck,
    title: "Fast Nationwide Shipping",
    desc: "Same-day dispatch on in-stock items with real-time tracking on every order.",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    desc: "Our automotive specialists are available around the clock to help you find the right part.",
  },
  {
    icon: Award,
    title: "Industry Certified",
    desc: "Certified by leading automotive associations with a proven track record since 2009.",
  },
];

const TEAM = [
  { name: "Robert Hayes", role: "Founder & CEO", initials: "RH" },
  { name: "Sandra Kim", role: "Head of Operations", initials: "SK" },
  { name: "Marcus Webb", role: "Lead Parts Specialist", initials: "MW" },
  { name: "Priya Nair", role: "Customer Success Manager", initials: "PN" },
];

const FEATURES = [
  "Genuine OEM and aftermarket parts",
  "Fast nationwide shipping",
  "Expert technical support",
  "30-day hassle-free returns",
  "Competitive wholesale pricing",
  "Trusted by 50,000+ customers",
];

export function AboutPageContent() {
  return (
    <>
      {/* Breadcrumb Hero */}
      <section className="relative bg-[#111111] py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">About Us</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-orange-500 transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-orange-500">About Us</span>
          </nav>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual side */}
            <div className="relative">
              <div className="bg-[#1a1a1a] rounded-lg aspect-video flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <div className="text-8xl mb-4">🚗</div>
                  <p className="text-gray-500 text-sm">Quality Parts Since 2009</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white rounded-lg p-5 shadow-xl">
                <div className="text-3xl font-extrabold">15+</div>
                <div className="text-xs font-medium uppercase tracking-wide">Years of Trust</div>
              </div>
              {/* Appointment card */}
              <div className="absolute -top-6 -left-6 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 shadow-xl hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Call Us Anytime</p>
                    <p className="text-white text-sm font-bold">+1 543-705-8174</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content side */}
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
                Who We Are
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                Your Trusted Source for Quality Auto Parts
              </h2>
              <p className="text-gray-400 mb-5 leading-relaxed">
                With over 15 years in the industry, Car Parts has built a reputation for delivering
                genuine and high-quality aftermarket components. We serve individual car owners,
                mechanics, and fleet managers across the country.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Our extensive catalog covers everything from engine internals to exterior accessories,
                backed by expert support and fast delivery. We believe every driver deserves reliable
                parts at fair prices.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-orange-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/#products"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded transition"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-orange-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{value}</div>
                <div className="text-orange-100 text-sm font-medium uppercase tracking-widest">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#1a1a1a] border border-white/5 rounded-lg p-7 group hover:border-orange-500/40 transition"
              >
                <div className="w-12 h-12 rounded bg-orange-500/10 flex items-center justify-center mb-5 group-hover:bg-orange-500 transition">
                  <Icon className="h-6 w-6 text-orange-500 group-hover:text-white transition" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Our Team
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Meet the Experts Behind Car Parts
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map(({ name, role, initials }) => (
              <div key={name} className="group text-center">
                <div className="relative mb-5 mx-auto w-40 h-40">
                  <div className="w-full h-full rounded-full bg-[#1a1a1a] border-2 border-white/10 group-hover:border-orange-500 transition flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-orange-500">{initials}</span>
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/20 group-hover:border-orange-500/50 transition scale-110" />
                </div>
                <h3 className="text-white font-bold text-lg">{name}</h3>
                <p className="text-orange-500 text-sm mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Appointment Banner */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-2xl px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Users className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
                  Book an Appointment
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Need Help Finding the Right Part?
              </h2>
              <p className="text-orange-100 mt-3 max-w-xl">
                Our specialists are available 24/7. Reach out and we'll help you find exactly what
                your vehicle needs — fast.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-3.5 rounded transition"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
              <Link
                href="/#products"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-orange-500 font-bold px-8 py-3.5 rounded transition"
              >
                Browse Parts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
