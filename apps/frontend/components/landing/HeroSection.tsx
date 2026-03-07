"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-medium text-gray-200 uppercase tracking-wider mb-4">
            Quality Parts for Every Ride
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            From engine components to braking systems
          </h1>
          <p className="text-lg text-gray-200 mb-8">
            We offer top-notch parts that meet the highest standards of quality and durability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/#products">Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base border-white/30 text-black hover:bg-white/10">
              <Link href="/#about">About Us</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-gray-200">
            <Phone className="h-4 w-4" />
            <span>Call Center: 543-705-8174</span>
          </div>
        </div>
      </div>
    </section>
  );
}
