/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Redirect old Vite routes to new Next.js routes
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/editor',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
