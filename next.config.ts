import type { NextConfig } from 'next';

// Static export is opt-in (used by scripts/build-static.mjs for Cloudflare Pages).
// The normal build keeps the API routes (health check + local-only admin) working.
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig: NextConfig = {
  output: isStaticExport ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
