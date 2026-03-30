"use client";

import Link from "next/link";
import {
  ChevronRight, Phone, Download, CheckCircle, ArrowRight,
  Truck, Plane, Ship, Train, Package, MapPin,
  Shield, Clock, BarChart3, Zap,
} from "lucide-react";

const SERVICE_LINKS = [
  { label: "Air Freight", href: "/services/air-freight", icon: Plane },
  { label: "Sea Freight", href: "/services/sea-freight", icon: Ship },
  { label: "Road Freight", href: "/road-freight", icon: Truck },
  { label: "Train Freight", href: "/services/train-freight", icon: Train },
  { label: "Land Transport", href: "/services/land-transport", icon: MapPin },
  { label: "Other Solutions", href: "/services/other-solutions", icon: Package },
];

const CHECKLIST = [
  "Customer engagement matters",
  "Research beyond the business plan",
  "Transportation across Europe",
  "Logistics ground in Asia Pacific",
  "Logistics ground in South America",
  "End-to-end supply chain visibility",
];

const STRENGTHS = [
  {
    icon: Shield,
    title: "Certified & Compliant",
    desc: "All operations meet international freight standards with full regulatory compliance and certified handling procedures.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "99% on-time delivery rate backed by real-time monitoring, proactive alerts, and dedicated operations teams.",
  },
  {
    icon: BarChart3,
    title: "Transparent Pricing",
    desc: "No hidden fees. Upfront quotes with full cost breakdowns so you always know what you're paying for.",
  },
  {
    icon: Zap,
    title: "Fast & Flexible",
    desc: "Express options and flexible scheduling to meet urgent deadlines and adapt to your business rhythm.",
  },
];

interface Props {
  serviceName?: string;
  serviceSlug?: string;
  breadcrumbLabel?: string;
}

export function ServiceDetailsPageContent({
  serviceName = "Road Freight",
  serviceSlug = "road-freight",
  breadcrumbLabel = "Service Details",
}: Props) {
  return (
    <>
      {/* Breadcrumb Hero */}
      <section className="relative bg-[#111111] py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: "var(--accent-500)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent-500)" }}
          >
            Our Services
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            {breadcrumbLabel}
          </h1>
          <p className="text-gray-400 max-w-xl mb-6">
            Comprehensive logistics solutions tailored to your business needs — reliable, fast, and fully tracked.
          </p>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/#services" className="hover:text-white transition">
              Services
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span style={{ color: "var(--accent-500)" }}>{breadcrumbLabel}</span>
          </nav>
        </div>
      </section>

      {/* Main Content: Sidebar + Content */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-start">

            {/* ── Left: Main Content ── */}
            <div>
              {/* Service Overview */}
              <div className="mb-12">
                <p
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--accent-500)" }}
                >
                  Service Overview
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                  {serviceName} — End-to-End Solutions
                </h2>
                <p className="text-gray-400 leading-relaxed mb-5">
                  We deliver globally optimized, highly efficient logistics solutions built for modern businesses.
                  Our approach combines cutting-edge technology with deep industry expertise to ensure your cargo
                  moves seamlessly from origin to destination — on time, every time.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  From strategic route planning to real-time tracking and customs clearance, every step of your
                  shipment is handled with precision. We partner with businesses of all sizes to provide scalable,
                  cost-effective freight solutions that grow with your needs.
                </p>
              </div>

              {/* Image + Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14 items-center">
                {/* Image placeholder */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-lg aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}>
                      <Truck className="h-10 w-10" style={{ color: "var(--accent-500)" }} />
                    </div>
                    <p className="text-gray-500 text-sm">{serviceName}</p>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <p
                    className="text-sm font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "var(--accent-500)" }}
                  >
                    Global Transaction Advisory
                  </p>
                  <ul className="space-y-3">
                    {CHECKLIST.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                        <CheckCircle
                          className="h-4 w-4 shrink-0 mt-0.5"
                          style={{ color: "var(--accent-500)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--accent-500)" }}
                >
                  Our Strengths
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 leading-tight">
                  Our Strengths And Advantages
                </h2>
                <p className="text-gray-400 leading-relaxed mb-10">
                  We combine global reach with local expertise to deliver freight solutions that are reliable,
                  transparent, and built around your business goals. Our strengths are the foundation of every
                  shipment we handle.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {STRENGTHS.map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="group bg-[#1a1a1a] border border-white/5 rounded-lg p-6 hover:border-white/20 transition cursor-pointer"
                    >
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center mb-4 transition group-hover:[background-color:var(--accent-500)]"
                        style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}
                      >
                        <Icon
                          className="h-6 w-6 group-hover:text-white transition"
                          style={{ color: "var(--accent-500)" }}
                        />
                      </div>
                      <h4 className="text-white font-bold mb-2">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Sidebar ── */}
            <aside className="space-y-6 lg:sticky lg:top-24">

              {/* Service List */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
                <div
                  className="px-6 py-4"
                  style={{ backgroundColor: "var(--accent-500)" }}
                >
                  <h3 className="text-white font-bold text-lg">All Services</h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {SERVICE_LINKS.map(({ label, href, icon: Icon }) => {
                    const isActive = href.includes(serviceSlug);
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          className="flex items-center justify-between px-6 py-4 transition group cursor-pointer"
                          style={isActive ? { color: "var(--accent-500)" } : { color: "#9ca3af" }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.color = "#9ca3af";
                          }}
                        >
                          <span className="flex items-center gap-3 text-sm font-medium">
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Contact Widget */}
              <div
                className="rounded-lg p-6 text-center"
                style={{ backgroundColor: "var(--accent-500)" }}
              >
                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
                  Contact us for any advice
                </p>
                <p className="text-white text-sm mb-4">
                  Need help? Talk to an expert
                </p>
                <a
                  href="tel:+18921231199"
                  className="flex items-center justify-center gap-2 text-white font-extrabold text-xl mb-5 hover:opacity-80 transition cursor-pointer"
                >
                  <Phone className="h-5 w-5" />
                  +1 892 123 1199
                </a>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 bg-white font-bold text-sm px-6 py-3 rounded w-full transition hover:bg-white/90 cursor-pointer"
                  style={{ color: "var(--accent-500)" }}
                >
                  Get a Free Quote <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Download PDF */}
              <button
                className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] border border-white/10 text-white font-semibold text-sm px-6 py-4 rounded-lg hover:border-white/30 transition cursor-pointer"
                onClick={() => {}}
              >
                <Download className="h-5 w-5" style={{ color: "var(--accent-500)" }} />
                Download PDF Brochure
              </button>
            </aside>

          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8"
            style={{ backgroundColor: "var(--accent-500)" }}
          >
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Truck className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
                  Start Shipping Today
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Ready to Move Your Freight?
              </h2>
              <p className="text-white/80 mt-3 max-w-xl">
                Get a free quote in minutes. Our team is available 24/7 to plan your shipment and ensure it arrives on time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-3.5 rounded transition hover:bg-white/90 cursor-pointer"
                style={{ color: "var(--accent-500)" }}
              >
                <Phone className="h-4 w-4" /> Get a Quote
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-bold px-8 py-3.5 rounded transition cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "var(--accent-500)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "white";
                }}
              >
                All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
