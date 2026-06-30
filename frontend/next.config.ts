import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Stacks packages from the server bundle — they use browser globals
  // (window, document, crypto) at module-evaluation time and must never run on the server.
  serverExternalPackages: [
    '@stacks/connect',
    '@stacks/auth',
    '@stacks/network',
    '@stacks/transactions',
    '@stacks/encryption',
    '@stacks/profile',
  ],
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
