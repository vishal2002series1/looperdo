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
    // 🚀 Keep this: it forces Next.js not to bundle Prisma into the Javascript, keeping it separate
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // 🚀 We are expanding the exclude list to ensure ABSOLUTELY NO dev engines or extra Node modules slip in
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@prisma/engines/schema-engine-*',
        'node_modules/@prisma/engines/migration-engine-*',
        'node_modules/@prisma/engines/introspection-engine-*',
        'node_modules/@prisma/engines/prisma-fmt-*',
        'node_modules/.prisma/client/schema-engine-*',
        'node_modules/.prisma/client/migration-engine-*',
        'node_modules/typescript/**',
        'node_modules/eslint/**',
      ],
    },
  },
};

module.exports = nextConfig;