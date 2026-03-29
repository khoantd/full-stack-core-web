"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Phone, Mail, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { getStoredToken } from "@/api/axiosClient";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Road Freight", href: "/road-freight" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/#products" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasToken(!!getStoredToken());
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-[#0a0a0a] border-b border-white/10 text-sm text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-orange-500" />
              +1 543-705-8174
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-orange-500" />
              support@carparts.com
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-orange-500 transition"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="hover:text-orange-500 transition"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-orange-500 transition"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href="https://youtube.com" aria-label="YouTube" className="hover:text-orange-500 transition"><Youtube className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#111111]/95 backdrop-blur shadow-lg"
            : "bg-[#111111]"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <span className="text-orange-500">Car</span>Parts
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-orange-500 transition text-sm font-medium uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {hasToken ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded transition"
              >
                Get a Quote
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#111111] px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-300 hover:text-orange-500 text-sm font-medium uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {hasToken ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 mt-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2 rounded"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            ) : (
              <button
                onClick={() => { setLoginOpen(true); setMenuOpen(false); }}
                className="w-full mt-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2 rounded"
              >
                Get a Quote
              </button>
            )}
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
