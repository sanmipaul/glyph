import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @stacks/* packages use browser globals at module-evaluation time;
  // exclude them from the server bundle so SSR prerendering doesn't crash.
  serverExternalPackages: [
    '@stacks/connect',
    '@stacks/auth',
    '@stacks/network',
    '@stacks/transactions',
    '@stacks/encryption',
    '@stacks/profile',
  ],
  webpack: (config) => {
    // Stub out Node built-ins that @stacks/* packages reference but don't need in the browser
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
