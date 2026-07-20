import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lhinowatqfwcqnfhorfw.supabase.co",
      },
    ],
  },
};

export default nextConfig;