/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'rwandair-cargo-portal-nnvj.vercel.app'],
    },
  },
};

export default nextConfig;
