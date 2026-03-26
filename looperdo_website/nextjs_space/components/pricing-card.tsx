'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  icon: any;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started and explore the platform',
    icon: Zap,
    features: [
      '1 certification track',
      '3 adaptive tests per month',
      'Basic readiness score',
      'Limited topic breakdown',
      'Community support',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Everything you need to pass your exam',
    icon: Crown,
    popular: true,
    features: [
      '1 certification track',
      'Unlimited adaptive tests',
      'Full readiness score tracking',
      'Personalized study workbooks',
      'Detailed sub-topic proficiency',
      'AI-powered diagnosis reports',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'All-Access',
    price: '$49',
    period: '/month',
    description: 'Unlimited access to every certification',
    icon: Sparkles,
    features: [
      'All certification tracks',
      'Unlimited adaptive tests',
      'Full readiness score tracking',
      'Personalized study workbooks',
      'Detailed sub-topic proficiency',
      'AI-powered diagnosis reports',
      'Priority support',
      'Early access to new certs',
    ],
    cta: 'Get All-Access',
  },
];

export default function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
      {tiers.map((tier: any, i: number) => {
        const Icon = tier?.icon ?? Zap;
        return (
          <motion.div
            key={tier?.name ?? i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`relative rounded-lg p-6 flex flex-col ${
              tier?.popular
                ? 'bg-[#1e3a5f] text-white shadow-xl scale-[1.02] border-2 border-[#2563eb]'
                : 'bg-white text-[#1e3a5f] shadow-sm border border-gray-100 hover:shadow-md'
            } transition-shadow`}
          >
            {tier?.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <div className="mb-4">
              <Icon className={`w-8 h-8 mb-3 ${tier?.popular ? 'text-[#60b5ff]' : 'text-[#2563eb]'}`} />
              <h3 className="text-xl font-bold">{tier?.name ?? ''}</h3>
              <p className={`text-sm mt-1 ${tier?.popular ? 'text-blue-200' : 'text-gray-500'}`}>{tier?.description ?? ''}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{tier?.price ?? ''}</span>
              <span className={`text-sm ${tier?.popular ? 'text-blue-200' : 'text-gray-400'}`}>{tier?.period ?? ''}</span>
            </div>
            <ul className="flex-1 space-y-3 mb-6">
              {(tier?.features ?? []).map((f: string, j: number) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier?.popular ? 'text-[#10b981]' : 'text-[#10b981]'}`} />
                  <span className={tier?.popular ? 'text-gray-200' : 'text-gray-600'}>{f ?? ''}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`block text-center py-3 rounded-md font-semibold text-sm transition-colors ${
                tier?.popular
                  ? 'bg-[#2563eb] text-white hover:bg-[#3b82f6]'
                  : 'bg-[#1e3a5f] text-white hover:bg-[#2563eb]'
              }`}
            >
              {tier?.cta ?? 'Get Started'}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
