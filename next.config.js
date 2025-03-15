/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  webpack: (config, { isServer }) => {
    // If not on the server, treat these modules as external
    if (!isServer) {
      config.externals = {
        'gcp-metadata': 'gcp-metadata',
        'gaxios': 'gaxios',
        'https-proxy-agent': 'https-proxy-agent' // Add this as well
      };
    }
    return config;
  },
};

export default nextConfig;

