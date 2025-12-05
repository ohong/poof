import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads (10 files × 15MB = 150MB max)
  experimental: {
    proxyClientMaxBodySize: '150mb',
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'zoyrfqgjvenzvtgrplth.supabase.co',
      },
    ],
  },
};

export default nextConfig;
