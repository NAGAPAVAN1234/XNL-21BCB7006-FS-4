/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Optional: Add other configurations as needed
  images: {
    // Configure image domains if using external images
    domains: ['example.com'], // Replace with your domains
  },
  // Optional: Custom Webpack configuration if needed
  webpack: (config) => {
    // Example: Add any custom rules or plugins here
    return config;
  },
};

export default nextConfig;
