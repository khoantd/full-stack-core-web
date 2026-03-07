"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer id="about" className="bg-slate-900 text-slate-300 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="font-bold text-xl text-white">
              Car Parts
            </Link>
            <p className="mt-4 text-sm max-w-md">
              From engine components to braking systems, we offer top-notch parts that meet the highest standards of quality and durability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#products" className="hover:text-white transition">Products</Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition">Categories</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">CMS Dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <p className="text-sm">Call Center: 543-705-8174</p>
            <p className="text-sm mt-1">support@carparts.com</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Car Parts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
