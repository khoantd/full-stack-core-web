import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductCategories } from "@/components/landing/ProductCategories";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Parts - Quality Auto Parts for Every Ride",
  description:
    "From engine components to braking systems, we offer top-notch parts that meet the highest standards of quality and durability.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main className="pt-16">
        <HeroSection />
        <ProductCategories />
        <FeaturedProducts />
        <LandingFooter />
      </main>
    </div>
  );
}
