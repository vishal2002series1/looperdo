import { certifications } from '@/lib/certifications';
import CertDetailClient from './cert-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (certifications ?? []).map((c: any) => ({ slug: c?.slug ?? '' }));
}

export default function CertDetailPage({ params }: { params: { slug: string } }) {
  const cert = (certifications ?? []).find((c: any) => c?.slug === params?.slug);
  if (!cert) return notFound();
  return <CertDetailClient cert={cert} />;
}
