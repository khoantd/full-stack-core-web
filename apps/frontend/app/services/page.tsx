import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ServicesPageContent } from "@/components/landing/ServicesPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services - Car Parts",
  description:
    "Explore our full range of logistics services — air freight, sea freight, road, rail, land transport, and specialized cargo solutions.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />
      <main>
        <ServicesPageContent />
      </main>
      <LandingFooter />
    </div>
  );
}
