'use client';

import { motion } from 'framer-motion';
import { CreditCard, Check, X } from 'lucide-react';
import PricingCards from '@/components/pricing-card';
import SectionReveal from '@/components/section-reveal';

const comparisonFeatures = [
  { feature: 'Certification Tracks', free: '1', pro: '1', allAccess: 'All 6+' },
  { feature: 'Adaptive Tests', free: '3/month', pro: 'Unlimited', allAccess: 'Unlimited' },
  { feature: 'Exam Readiness Score', free: 'Basic', pro: 'Full', allAccess: 'Full' },
  { feature: 'Sub-Topic Proficiency', free: false, pro: true, allAccess: true },
  { feature: 'AI Diagnosis Reports', free: false, pro: true, allAccess: true },
  { feature: 'Personalized Workbooks', free: false, pro: true, allAccess: true },
  { feature: 'Mind Maps & Tricks', free: false, pro: true, allAccess: true },
  { feature: 'YouTube Resource Links', free: false, pro: true, allAccess: true },
  { feature: 'Priority Support', free: false, pro: true, allAccess: true },
  { feature: 'Early Access to New Certs', free: false, pro: false, allAccess: true },
];

export default function PricingClient() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CreditCard className="w-10 h-10 mx-auto mb-4 text-[#60b5ff]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple, transparent pricing</h1>
            <p className="text-blue-100/80 max-w-lg mx-auto">
              Start free and upgrade when you&apos;re ready. Every plan includes the core flywheel that gets you certified.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-gray-50/50 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <PricingCards />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[900px] px-4">
          <SectionReveal>
            <h2 className="text-2xl font-bold text-[#1e3a5f] text-center mb-10">Feature Comparison</h2>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-400 py-3 pr-4">Feature</th>
                    <th className="text-center text-sm font-bold text-[#1e3a5f] py-3 px-4">Free</th>
                    <th className="text-center text-sm font-bold text-[#2563eb] py-3 px-4 bg-blue-50/50 rounded-t-lg">Pro</th>
                    <th className="text-center text-sm font-bold text-[#1e3a5f] py-3 px-4">All-Access</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="text-sm text-gray-600 py-3 pr-4">{row?.feature ?? ''}</td>
                      {['free', 'pro', 'allAccess'].map((plan: string) => {
                        const val = row?.[plan];
                        return (
                          <td key={plan} className={`text-center py-3 px-4 ${plan === 'pro' ? 'bg-blue-50/50' : ''}`}>
                            {typeof val === 'boolean' ? (
                              val ? <Check className="w-4 h-4 text-[#10b981] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-sm font-medium text-[#1e3a5f]">{val ?? ''}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
