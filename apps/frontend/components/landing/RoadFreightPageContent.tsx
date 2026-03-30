"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Truck, MapPin, Clock, Shield, Package, BarChart3,
  Phone, ArrowRight, CheckCircle, Plus, Minus, Globe, Zap,
  HeadphonesIcon, Star,
} from "lucide-react";

const SERVICES = [
  { icon: Truck, title: "Full Truckload (FTL)", desc: "Dedicated truck capacity for large shipments. Direct routes with no stops, ensuring faster delivery and reduced handling." },
  { icon: Package, title: "Less Than Truckload (LTL)", desc: "Cost-effective solution for smaller freight. Share truck space with other shippers and only pay for what you use." },
  { icon: Globe, title: "Cross-Border Freight", desc: "Seamless international road freight with full customs clearance support and compliance documentation." },
  { icon: Zap, title: "Express Road Delivery", desc: "Time-critical shipments handled with priority routing and guaranteed delivery windows." },
  { icon: Shield, title: "Hazardous Goods Transport", desc: "Certified handling of dangerous goods with full regulatory compliance and trained drivers." },
  { icon: HeadphonesIcon, title: "24/7 Freight Support", desc: "Round-the-clock operations team monitoring every shipment and ready to resolve any issue instantly." },
];

const STATS = [
  { value: "25+", label: "Years Experience" },
  { value: "10K+", label: "Shipments Monthly" },
  { value: "150+", label: "Truck Fleet" },
  { value: "99%", label: "On-Time Delivery" },
];

const PROCESS = [
  { step: "01", title: "Request a Quote", desc: "Fill in your shipment details and get an instant competitive quote tailored to your freight needs." },
  { step: "02", title: "Schedule Pickup", desc: "Choose your preferred pickup date and time. Our driver arrives at your location ready to load." },
  { step: "03", title: "Real-Time Tracking", desc: "Monitor your freight every mile of the journey with live GPS tracking and status updates." },
  { step: "04", title: "Safe Delivery", desc: "Your cargo arrives on time and in perfect condition, with proof of delivery confirmation." },
];

const FAQS = [
  { q: "What types of freight can you transport?", a: "We handle all types of road freight including general cargo, palletized goods, oversized loads, temperature-sensitive shipments, and hazardous materials with full compliance." },
  { q: "How do I track my shipment?", a: "Every shipment gets a unique tracking number. Use our online portal or mobile app for real-time GPS tracking, estimated arrival times, and delivery notifications." },
  { q: "Do you offer cross-border road freight?", a: "Yes. We operate cross-border routes with dedicated customs brokers handling all documentation, duties, and compliance requirements for smooth border crossings." },
  { q: "What is the difference between FTL and LTL?", a: "FTL (Full Truckload) gives you exclusive use of an entire truck — ideal for large shipments. LTL (Less Than Truckload) lets you share truck space with other shippers, reducing costs for smaller loads." },
  { q: "How are freight rates calculated?", a: "Rates depend on weight, dimensions, distance, freight class, and any special handling requirements. Get an instant quote through our online tool or contact our team." },
];

const TEAM = [
  { name: "Marcus Webb", role: "Head of Road Operations", initials: "MW" },
  { name: "Sandra Kim", role: "Fleet Manager", initials: "SK" },
  { name: "Robert Hayes", role: "Logistics Director", initials: "RH" },
  { name: "Priya Nair", role: "Customer Success Lead", initials: "PN" },
];

const FEATURES = [
  "GPS-tracked fleet across all routes",
  "Certified drivers with safety training",
  "Full cargo insurance coverage",
  "Flexible pickup & delivery windows",
  "Dedicated account management",
  "Paperless documentation & e-POD",
];

export function RoadFreightPageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Breadcrumb Hero */}
      <section className="relative bg-[#111111] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--accent-500)" }} />
        <div className="absolute right-0 bottom-0 opacity-5 text-[200px] leading-none select-none pointer-events-none">🚛</div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>Our Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Road Freight</h1>
          <p className="text-gray-400 max-w-xl mb-6">Reliable, cost-effective road freight solutions connecting businesses across the country and beyond.</p>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/#services" className="hover:text-white transition">Services</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span style={{ color: "var(--accent-500)" }}>Road Freight</span>
          </nav>
        </div>
      </section>

      {/* About / Intro */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-[#1a1a1a] rounded-lg aspect-video flex items-center justify-center border border-white/5 overflow-hidden">
                <div className="text-center">
                  <div className="text-8xl mb-4">🚛</div>
                  <p className="text-gray-500 text-sm">Road Freight Solutions</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-white rounded-lg p-5 shadow-xl" style={{ backgroundColor: "var(--accent-500)" }}>
                <div className="text-3xl font-extrabold">25+</div>
                <div className="text-xs font-medium uppercase tracking-wide">Years on the Road</div>
              </div>
              <div className="absolute -top-6 -left-6 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 shadow-xl hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}>
                    <Phone className="h-5 w-5" style={{ color: "var(--accent-500)" }} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">24/7 Freight Hotline</p>
                    <p className="text-white text-sm font-bold">+1 543-705-8174</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>About Road Freight</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">We Get Your Cargo Where It Needs to Go</h2>
              <p className="text-gray-400 mb-5 leading-relaxed">With a fleet of 150+ modern trucks and 25 years of road freight expertise, we deliver reliable transport solutions for businesses of all sizes. From local deliveries to long-haul cross-border shipments, we've got the network and the know-how.</p>
              <p className="text-gray-400 mb-8 leading-relaxed">Our drivers are fully certified, our vehicles are GPS-tracked, and every shipment is covered by comprehensive cargo insurance. We don't just move freight — we move it safely, on time, every time.</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded transition cursor-pointer"
                style={{ backgroundColor: "var(--accent-500)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-600)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-500)")}
              >
                Get a Free Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16" style={{ backgroundColor: "var(--accent-500)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{value}</div>
                <div className="text-white/80 text-sm font-medium uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>Our Services</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Road Freight Solutions</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">From single pallets to full truckloads, we offer a complete range of road freight services tailored to your business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group bg-[#1a1a1a] border border-white/5 rounded-lg p-7 hover:border-white/20 transition cursor-pointer">
                <div className="w-14 h-14 rounded flex items-center justify-center mb-5 transition group-hover:[background-color:var(--accent-500)]"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}>
                  <Icon className="h-7 w-7 group-hover:text-white transition" style={{ color: "var(--accent-500)" }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{desc}</p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-3 transition-all cursor-pointer"
                  style={{ color: "var(--accent-500)" }}
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Simple 4-Step Process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 h-px z-0 opacity-20" style={{ backgroundColor: "var(--accent-500)", width: "calc(100% - 4rem)", left: "4rem" }} />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 border-2" style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-500) 30%, transparent)" }}>
                    <span className="font-extrabold text-lg" style={{ color: "var(--accent-500)" }}>{step}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us + FAQ */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 leading-tight">The Fastest & Most Reliable Road Freight</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Nationwide Coverage", desc: "Our routes span the entire country with strategic hubs for fast regional distribution." },
                  { icon: Clock, title: "On-Time Guarantee", desc: "99% on-time delivery rate backed by real-time monitoring and proactive issue resolution." },
                  { icon: BarChart3, title: "Transparent Pricing", desc: "No hidden fees. Get upfront quotes with full cost breakdowns before you commit." },
                  { icon: Star, title: "Proven Track Record", desc: "25 years of trusted service with thousands of satisfied clients across every industry." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}>
                      <Icon className="h-5 w-5" style={{ color: "var(--accent-500)" }} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 leading-tight">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQS.map(({ q, a }, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-white font-semibold text-sm pr-4">{q}</span>
                      {openFaq === i
                        ? <Minus className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                        : <Plus className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                      }
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5">
                        <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>Our Experts</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Meet Our Road Freight Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map(({ name, role, initials }) => (
              <div key={name} className="group text-center">
                <div className="relative mb-5 mx-auto w-40 h-40">
                  <div
                    className="w-full h-full rounded-full bg-[#1a1a1a] border-2 border-white/10 flex items-center justify-center transition"
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-500)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                  >
                    <span className="text-3xl font-extrabold" style={{ color: "var(--accent-500)" }}>{initials}</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-dashed scale-110" style={{ borderColor: "color-mix(in srgb, var(--accent-500) 20%, transparent)" }} />
                </div>
                <h3 className="text-white font-bold text-lg">{name}</h3>
                <p className="text-sm mt-1" style={{ color: "var(--accent-500)" }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8" style={{ backgroundColor: "var(--accent-500)" }}>
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Truck className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">Start Shipping Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Ready to Move Your Freight?</h2>
              <p className="text-white/80 mt-3 max-w-xl">Get a free quote in minutes. Our team is available 24/7 to plan your road freight shipment and ensure it arrives on time.</p>
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
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "var(--accent-500)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "white"; }}
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
