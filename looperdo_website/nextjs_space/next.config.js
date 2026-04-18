/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true 
  },
  experimental: {
    // This tells Vercel to heavily bundle and minify the server files
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  }
};

module.exports = nextConfig;