import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d32vzsop7y1h3k.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t14livenews.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
