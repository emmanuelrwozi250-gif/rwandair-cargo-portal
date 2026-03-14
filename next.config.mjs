/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'altitude-inc.vercel.app', '*.vercel.app'],
    },
  },
};

export default nextConfig;
