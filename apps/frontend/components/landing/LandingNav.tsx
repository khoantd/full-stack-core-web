"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { getStoredToken } from "@/api/axiosClient";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getStoredToken());
  }, []);

  const authButton = hasToken ? (
    <Button asChild variant="default">
      <Link href="/dashboard" className="inline-flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        Admin
      </Link>
    </Button>
  ) : (
    <Button onClick={() => setLoginOpen(true)} variant="default">
      Login
    </Button>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Car</span> Partss
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#categories" className="text-muted-foreground hover:text-foreground transition">
              Categories
            </Link>
            <Link href="/#products" className="text-muted-foreground hover:text-foreground transition">
              Products
            </Link>
            <Link href="/#about" className="text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            {authButton}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <Link
              href="/#categories"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/#products"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/#about"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            {hasToken ? (
              <Button asChild className="w-full">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            ) : (
              <Button onClick={() => { setLoginOpen(true); setMenuOpen(false); }} className="w-full">
                Login
              </Button>
            )}
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
