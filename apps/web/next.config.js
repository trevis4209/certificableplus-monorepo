/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments (reduces image size by 60-70%)
  output: 'standalone',

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

// Aggiungi configurazione webpack solo per build di produzione
if (process.env.NODE_ENV === 'production') {
  nextConfig.webpack = (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Performance budget per produzione
      config.performance = {
        maxAssetSize: 300000, // 300KB
        maxEntrypointSize: 500000, // 500KB
        hints: 'warning',
      };
    }
    return config;
  };
}

// Bundle analyzer per sviluppo
const withBundleAnalyzer = process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer')({
  enabled: true,
}) : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);