import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductCategories } from "@/components/landing/ProductCategories";
import { StatsSection } from "@/components/landing/StatsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingData } from "@/services/landing.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Parts - Quality Auto Parts for Every Ride",
  description:
    "From engine components to braking systems, we offer top-notch parts that meet the highest standards of quality and durability.",
};

export default async function HomePage() {
  const { products, categories } = await getLandingData();

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />
      <main>
        <HeroSection />
        <ProductCategories categories={categories} />
        <StatsSection />
        <AboutSection />
        <FeaturedProducts products={products} />
        <TestimonialsSection />
        <BlogSection />
        <ContactSection />
        <LandingFooter />
      </main>
    </div>
  );
}
