import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'LooperDo | Know Exactly When You\'re Ready to Pass',
  description: 'Adaptive exam preparation that builds true confidence. Track your readiness score and know exactly when you\'re ready to pass your certification exam.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'LooperDo | Adaptive Exam Prep',
    description: 'Know exactly when you\'re ready to pass. Adaptive exam preparation with personalized learning workbooks.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
