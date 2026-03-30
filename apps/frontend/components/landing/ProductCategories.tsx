import Link from "next/link";
import type { LandingCategory } from "@/services/landing.service";

interface Props {
  categories: LandingCategory[];
}

export function ProductCategories({ categories }: Props) {
  return (
    <section id="services" className="py-20 bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-500)" }}>
            What We Offer
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Our Product Categories
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 rounded" style={{ backgroundColor: "var(--accent-500)" }} />
        </div>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href="/#products"
                className="group relative bg-[#1a1a1a] border border-white/5 rounded-lg p-8 hover:border-white/20 transition-all overflow-hidden cursor-pointer"
              >
                {/* Hover accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ backgroundColor: "var(--accent-500)" }} />

                <h3 className="text-white font-bold text-lg mb-2 transition group-hover:opacity-80">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {cat.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition" style={{ color: "var(--accent-500)" }}>
                  View Products →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
