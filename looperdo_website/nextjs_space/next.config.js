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
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    outputFileTracingExcludes: {
      '*': [
        // 🚀 Delete massive Prisma Dev/Migration engines from the production bundle!
        // This easily shaves off 20MB+ without touching a single frontend library.
        'node_modules/@prisma/engines/schema-engine-*',
        'node_modules/@prisma/engines/migration-engine-*',
        'node_modules/@prisma/engines/introspection-engine-*',
        'node_modules/@prisma/engines/prisma-fmt-*',
        'node_modules/.prisma/client/schema-engine-*',
        'node_modules/.prisma/client/migration-engine-*',
      ],
    },
  },
};

module.exports = nextConfig;