"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-yellow-500 text-gray-900 pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      {/* Yellow background with subtle pattern overlay */}
      <div className="absolute inset-0 bg-yellow-500" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-medium text-yellow-900 uppercase tracking-wider mb-4">
            Quality Parts for Every Ride
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900">
            From engine components to braking systems
          </h1>
          <p className="text-lg text-yellow-800 mb-8">
            We offer top-notch parts that meet the highest standards of quality and durability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base bg-gray-900 text-yellow-500 hover:bg-gray-800">
              <Link href="/#products">Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base border-gray-900/30 text-gray-900 hover:bg-yellow-400">
              <Link href="/#about">About Us</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-gray-900">
            <Phone className="h-4 w-4" />
            <span>Call Center: 543-705-8174</span>
          </div>
        </div>
      </div>
    </section>
  );
}
