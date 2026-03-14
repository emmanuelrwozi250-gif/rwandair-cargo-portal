import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),
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
