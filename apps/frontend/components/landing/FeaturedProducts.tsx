import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import type { LandingProduct } from "@/services/landing.service";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount * 1000);
}

interface Props {
  products: LandingProduct[];
}

export function FeaturedProducts({ products }: Props) {
  return (
    <section id="products" className="py-20 bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-500)" }}>
              Top Picks
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Featured Products
            </h2>
            <div className="mt-4 w-16 h-1 rounded" style={{ backgroundColor: "var(--accent-500)" }} />
          </div>
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-80"
            style={{ color: "var(--accent-500)" }}
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="group bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-[#222] flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-20 w-20 text-gray-700 transition" />
                  )}
                  {product.salePrice && (
                    <span className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: "var(--accent-500)" }}>
                      SALE
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.category?.name ?? ""}
                  </p>
                  <h3 className="text-white font-semibold mb-3 transition group-hover:opacity-70">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    {product.salePrice ? (
                      <>
                        <span className="font-bold text-lg" style={{ color: "var(--accent-500)" }}>
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-gray-600 text-sm line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
