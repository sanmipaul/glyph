import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Stacks ESM packages so webpack can bundle them for the client
  transpilePackages: ['@stacks/connect', '@stacks/auth'],
  // Keep Stacks packages out of the server bundle — they rely on browser globals
  serverExternalPackages: [
    '@stacks/connect',
    '@stacks/auth',
    '@stacks/network',
    '@stacks/transactions',
    '@stacks/encryption',
    '@stacks/profile',
  ],
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
