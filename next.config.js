/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      }
    ],
    domains: ['localhost'],
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      https: false,
      http: false,
      net: false,
      tls: false,
      querystring: false
    };
    return config;
  }
};

module.exports = nextConfig;
