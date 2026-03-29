import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AboutPageContent } from "@/components/landing/AboutPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Car Parts",
  description:
    "Learn about Car Parts — 15+ years delivering quality auto parts nationwide. Meet our team and discover our mission.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />
      <main>
        <AboutPageContent />
      </main>
      <LandingFooter />
    </div>
  );
}
