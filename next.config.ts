import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "libsql",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "memory-agencia-aws-s3.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
