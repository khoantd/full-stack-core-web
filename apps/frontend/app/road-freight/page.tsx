import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { RoadFreightPageContent } from "@/components/landing/RoadFreightPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Road Freight - Car Parts",
  description:
    "Reliable road freight solutions — FTL, LTL, cross-border, and express delivery. 25+ years of trusted transport with GPS-tracked fleet and 99% on-time delivery.",
};

export default function RoadFreightPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />
      <main>
        <RoadFreightPageContent />
      </main>
      <LandingFooter />
    </div>
  );
}
