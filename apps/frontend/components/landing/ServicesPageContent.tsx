import Link from "next/link";
import {
  ChevronRight, ArrowRight,
  Truck, Plane, Ship, Train, Package, MapPin,
  Shield, Clock, Globe, Zap, HeadphonesIcon, BarChart3,
} from "lucide-react";

const SERVICES = [
  {
    icon: Plane,
    title: "Air Freight",
    slug: "air-freight",
    desc: "Time-critical cargo delivered worldwide via express and standard air freight with full customs clearance and door-to-door options.",
    features: ["Express & standard options", "Global airline network", "Customs clearance included"],
  },
  {
    icon: Ship,
    title: "Sea Freight",
    slug: "sea-freight",
    desc: "Cost-effective ocean freight for large volume shipments. FCL and LCL options across all major global trade lanes.",
    features: ["FCL & LCL shipments", "Major port coverage", "Real-time cargo tracking"],
  },
  {
    icon: Truck,
    title: "Road Freight",
    slug: null, // uses /road-freight
    href: "/road-freight",
    desc: "Reliable FTL and LTL road freight with GPS-tracked fleet, certified drivers, and 99% on-time delivery across the country.",
    features: ["FTL & LTL options", "GPS-tracked fleet", "Cross-border routes"],
  },
  {
    icon: Train,
    title: "Train Freight",
    slug: "train-freight",
    desc: "Efficient rail freight connecting major industrial hubs. Ideal for heavy cargo over long distances with predictable schedules.",
    features: ["Heavy cargo capacity", "Fixed schedule reliability", "Eco-friendly option"],
  },
  {
    icon: MapPin,
    title: "Land Transport",
    slug: "land-transport",
    desc: "Flexible last-mile and regional land transport solutions for businesses needing reliable local and cross-border delivery.",
    features: ["Last-mile delivery", "Regional coverage", "Flexible scheduling"],
  },
  {
    icon: Package,
    title: "Other Solutions",
    slug: "other-solutions",
    desc: "Specialized logistics for oversized, hazardous, or temperature-sensitive cargo — fully compliant and expertly handled.",
    features: ["Hazardous goods certified", "Cold chain logistics", "Project cargo"],
  },
];

const WHY_US = [
  { icon: Globe, title: "Global Network", desc: "Operations spanning 50+ countries with trusted local partners at every hub." },
  { icon: Shield, title: "Fully Insured", desc: "Comprehensive cargo insurance on every shipment, no exceptions." },
  { icon: Clock, title: "99% On-Time", desc: "Industry-leading delivery reliability backed by real-time monitoring." },
  { icon: Zap, title: "Fast Quotes", desc: "Get competitive quotes in minutes, not days." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock operations team ready to resolve any issue instantly." },
  { icon: BarChart3, title: "Full Visibility", desc: "Live tracking and status updates from pickup to final delivery." },
];

export function ServicesPageContent() {
  return (
    <>
      {/* Breadcrumb Hero */}
      <section className="relative bg-[#111111] py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--accent-500)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
            What We Offer
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Our Services</h1>
          <p className="text-gray-400 max-w-xl mb-6">
            End-to-end logistics solutions — from air and sea freight to road, rail, and specialized cargo handling.
          </p>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span style={{ color: "var(--accent-500)" }}>Services</span>
          </nav>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
              Types of Logistics
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Popular Logistics Services</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Choose from our full range of freight and logistics services, each designed to meet specific shipping needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon: Icon, title, slug, href, desc, features }) => {
              const link = href ?? `/services/${slug}`;
              return (
                <div
                  key={title}
                  className="group bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* Card top accent bar */}
                  <div className="h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ backgroundColor: "var(--accent-500)" }} />

                  <div className="p-7">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded flex items-center justify-center mb-5 transition group-hover:[background-color:var(--accent-500)]"
                      style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}
                    >
                      <Icon className="h-7 w-7 group-hover:text-white transition" style={{ color: "var(--accent-500)" }} />
                    </div>

                    <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{desc}</p>

                    {/* Feature list */}
                    <ul className="space-y-2 mb-7">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent-500)" }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={link}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-3 transition-all cursor-pointer"
                      style={{ color: "var(--accent-500)" }}
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Reliability at Every Step</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
                <div
                  className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}
                >
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
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8"
            style={{ backgroundColor: "var(--accent-500)" }}
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Not Sure Which Service You Need?
              </h2>
              <p className="text-white/80 mt-3 max-w-xl">
                Talk to our logistics experts. We'll assess your requirements and recommend the best solution for your cargo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-3.5 rounded transition hover:bg-white/90 cursor-pointer"
                style={{ color: "var(--accent-500)" }}
              >
                Talk to an Expert <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
