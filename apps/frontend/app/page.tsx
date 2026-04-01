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
import { LandingThemeProvider } from "@/context/ThemeContext";
import { THEMES, DEFAULT_THEME } from "@/lib/themes";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Car Parts - Quality Auto Parts for Every Ride",
  description:
    "From engine components to braking systems, we offer top-notch parts that meet the highest standards of quality and durability.",
};

export default async function HomePage() {
  const { products, categories, config = {} } = await getLandingData();

  // Resolve theme vars server-side to avoid FOUC
  const themeKey = config.theme ?? DEFAULT_THEME;
  const themeVars = THEMES.find((t) => t.key === themeKey)?.vars ?? THEMES[0].vars;
  const inlineCss = `:root{${Object.entries(themeVars).map(([k, v]) => `${k}:${v}`).join(';')}}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineCss }} />
      <LandingThemeProvider initialTheme={themeKey}>
        <div className="min-h-screen bg-[#0d0d0d]">
          <LandingNav config={config} />
          <main>
            {config.heroEnabled !== false && <HeroSection config={config} />}
            {config.categoriesEnabled !== false && <ProductCategories categories={categories} />}
            {config.statsEnabled !== false && <StatsSection />}
            {config.aboutEnabled !== false && <AboutSection config={config} />}
            {config.productsEnabled !== false && <FeaturedProducts products={products} />}
            {config.testimonialsEnabled !== false && <TestimonialsSection />}
            {config.blogsEnabled !== false && <BlogSection />}
            {config.contactEnabled !== false && <ContactSection config={config} />}
          </main>
          <LandingFooter config={config} />
        </div>
      </LandingThemeProvider>
    </>
  );
}
