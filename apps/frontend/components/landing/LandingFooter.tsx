"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import type { LandingConfig } from "@/services/landing.service";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Road Freight", href: "/road-freight" },
  { label: "Products", href: "/#products" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

const SERVICES = [
  "Engine Parts",
  "Braking Systems",
  "Suspension",
  "Electrical",
  "Exhaust Systems",
  "Accessories",
];

interface Props {
  config?: LandingConfig;
}

export function LandingFooter({ config }: Props) {
  const phone = config?.phone || "+1 543-705-8174";
  const email = config?.email || "support@carparts.com";
  const address = config?.address || "123 Auto Drive, Detroit, MI 48201";
  const siteName = config?.siteName || "CarParts";

  const socials = [
    { Icon: Facebook, href: config?.facebook || "https://facebook.com", label: "Facebook" },
    { Icon: Twitter, href: config?.twitter || "https://twitter.com", label: "Twitter" },
    { Icon: Linkedin, href: config?.linkedin || "https://linkedin.com", label: "LinkedIn" },
    { Icon: Youtube, href: config?.youtube || "https://youtube.com", label: "YouTube" },
  ];
  return (
    <footer className="bg-[#0a0a0a] text-gray-400">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="font-extrabold text-2xl text-white mb-4 inline-block">
              {siteName}
            </Link>
            <p className="text-sm leading-relaxed mt-4 mb-6">
              Your trusted source for quality auto parts. Serving customers nationwide with genuine and aftermarket components since 2009.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer bg-white/5 hover:text-white"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-500)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gray-200 transition flex items-center gap-2"
                  >
                    <span style={{ color: "var(--accent-500)" }}>›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s}>
                  <Link
                    href="/#services"
                    className="text-sm hover:text-gray-200 transition flex items-center gap-2"
                  >
                    <span style={{ color: "var(--accent-500)" }}>›</span>
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--accent-500)" }} />
                {address}
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                {phone}
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                {email}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-300 transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-gray-300 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
