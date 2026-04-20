'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Loader2 } from 'lucide-react';
import SectionReveal from '@/components/section-reveal';

export default function ProfileClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [dbTier, setDbTier] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/student-profile', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.subscriptionTier) {
              setDbTier(data.subscriptionTier);
          }
        })
        .catch(console.error);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const activeTier = dbTier || (session?.user as any)?.subscriptionTier || 'FREE';
  const displayTierName = activeTier === 'ALL_ACCESS' ? 'All-Access' : activeTier === 'PRO' ? 'Pro' : 'Free';

  return (
    <div className="bg-gray-50/50 min-h-[80vh]">
      <div className="mx-auto max-w-[700px] px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Profile Settings</h1>
          <p className="text-gray-500 text-sm mb-8">Manage your account details and preferences.</p>
        </motion.div>

        <SectionReveal>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {session?.user?.name?.charAt?.(0)?.toUpperCase?.() ?? 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1e3a5f]">{session?.user?.name ?? 'Student'}</h2>
                <p className="text-sm text-gray-500">{session?.user?.email ?? ''}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-[10px] font-bold rounded ${
                    activeTier === 'ALL_ACCESS' ? 'bg-purple-100 text-purple-700' :
                    activeTier === 'PRO' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                }`}>
                    {displayTierName.toUpperCase()} PLAN
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: User, label: 'Full Name', value: session?.user?.name ?? 'Not set' },
                { icon: Mail, label: 'Email Address', value: session?.user?.email ?? 'Not set' },
                { icon: Shield, label: 'Account Type', value: `${displayTierName} Plan` },
                { icon: Calendar, label: 'Member Since', value: '2026' },
              ].map((item: any, i: number) => {
                const Icon = item?.icon ?? User;
                return (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-[#2563eb]" />
                    <div>
                      <p className="text-xs text-gray-400">{item?.label ?? ''}</p>
                      <p className="text-sm font-medium text-[#1e3a5f]">{item?.value ?? ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}