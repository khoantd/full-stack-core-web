import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Proxy public local media through this host (e.g. https://cms.brainspark.app/media/public/...).
   * Set PUBLIC_MEDIA_BASE_URL_LOCAL / PUBLIC_MEDIA_BASE_URL on the API to the same CMS origin.
   * Destination defaults to NEXT_PUBLIC_API_URL; use MEDIA_PROXY_TARGET for an internal URL in Docker.
   */
  async rewrites() {
    const proxyBase = trimTrailingSlashes(
      process.env.MEDIA_PROXY_TARGET ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001",
    );
    return [
      {
        source: "/media/public/:path*",
        destination: `${proxyBase}/media/public/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/services", destination: "/dashboard", permanent: false },
      { source: "/services/:path*", destination: "/dashboard", permanent: false },
      { source: "/blog", destination: "/dashboard", permanent: false },
      { source: "/blog/:path*", destination: "/dashboard", permanent: false },
      { source: "/about", destination: "/dashboard", permanent: false },
      { source: "/road-freight", destination: "/dashboard", permanent: false },
      { source: "/dashboard/settings/landing", destination: "/dashboard/settings", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

export default withNextIntl(nextConfig);
