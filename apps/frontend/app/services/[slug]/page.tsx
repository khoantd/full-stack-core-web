import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ServiceDetailsPageContent } from "@/components/landing/ServiceDetailsPageContent";
import { Metadata } from "next";

const SERVICE_META: Record<string, { name: string; description: string }> = {
  "air-freight": {
    name: "Air Freight",
    description: "Fast, reliable air freight solutions for time-sensitive cargo worldwide.",
  },
  "sea-freight": {
    name: "Sea Freight",
    description: "Cost-effective sea freight for large volume shipments across global trade lanes.",
  },
  "train-freight": {
    name: "Train Freight",
    description: "Efficient rail freight connecting major industrial hubs with reliable schedules.",
  },
  "land-transport": {
    name: "Land Transport",
    description: "Flexible land transport solutions for regional and cross-border deliveries.",
  },
  "other-solutions": {
    name: "Other Solutions",
    description: "Specialized logistics solutions tailored to unique freight requirements.",
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = SERVICE_META[slug];
  const name = meta?.name ?? "Service Details";
  return {
    title: `${name} - Car Parts`,
    description: meta?.description ?? "Professional logistics and freight services.",
  };
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params;
  const meta = SERVICE_META[slug];
  const serviceName = meta?.name ?? "Service Details";

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />
      <main>
        <ServiceDetailsPageContent
          serviceName={serviceName}
          serviceSlug={slug}
          breadcrumbLabel={serviceName}
        />
      </main>
      <LandingFooter />
    </div>
  );
}
