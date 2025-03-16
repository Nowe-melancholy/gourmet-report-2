import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gourmet-report-images.jackpot88230021.workers.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // パフォーマンス最適化
    optimizePackageImports: ['lucide-react'],
  },
  serverExternalPackages: [],
}

module.exports = nextConfig
