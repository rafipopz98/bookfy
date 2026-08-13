import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Generated manga panels are served from our own API route with a
    // `?v=<seed>` cache-buster (panels can be regenerated in place under the
    // same filename). Next.js 16 requires local image sources with a query
    // string to be explicitly allow-listed.
    localPatterns: [
      {
        pathname: "/api/visualize/images/**",
      },
    ],
  },
};

export default nextConfig;
