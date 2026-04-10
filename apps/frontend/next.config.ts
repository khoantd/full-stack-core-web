import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
