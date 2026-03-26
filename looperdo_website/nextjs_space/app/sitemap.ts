import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { certifications } from '@/lib/certifications';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = headers();
  const host = headersList?.get?.('x-forwarded-host') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const siteUrl = host?.startsWith?.('http') ? host : `https://${host}`;
  const staticPages = ['', '/certifications', '/pricing', '/about', '/faq', '/contact', '/login', '/signup'];
  const certPages = (certifications ?? []).map((c: any) => `/certifications/${c?.slug ?? ''}`);
  return [...staticPages, ...certPages].map((path: string) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
}
