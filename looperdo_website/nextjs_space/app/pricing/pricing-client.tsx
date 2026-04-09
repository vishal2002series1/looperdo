'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/pricing-config';

export default function PricingClient({ countryCode }: { countryCode: string }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // 🚀 FIX: Dynamically load pricing from our config based on edge middleware country code!
  // Fallback to 'ROW' (Rest of World) if the country code isn't explicitly US or IN
  const activeRegionConfig = PRICING_CONFIG[countryCode as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.ROW;
  
  const currencySymbol = activeRegionConfig.currency;
  
  const PRICING = {
    FREE: { price: '0', period: '/forever' },
    PRO: { price: activeRegionConfig.PRO.monthly, period: '/month' },
    ALL_ACCESS: { price: activeRegionConfig.ALL_ACCESS.monthly, period: '/month' }
  };

  const handleUpgrade = async (tier: string) => {
    setIsProcessing(tier);
    try {
      const res = await fetch('/api/mock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            tier: tier,
            track: tier === 'PRO' ? sessionStorage.getItem('lastViewedExam') || 'AWS Solutions Architect Associate' : null
        })
      });

      if (res.ok) {
        await update(); // Tell NextAuth to refresh the user session with the new tier
        router.push('/dashboard');
      } else {
        alert("Failed to process upgrade.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error during checkout.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#1e3a5f] mb-4">Master Your Certification</h1>
          <p className="text-xl text-gray-500">Stop memorizing. Start understanding with AI-driven adaptive learning.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* FREE TIER */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#1e3a5f]">{currencySymbol}{PRICING.FREE.price}</span>
                <span className="text-gray-500 font-medium">{PRICING.FREE.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Perfect for exploring the platform.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['1 Full Adaptive Test', '3 Targeted Topic Tests', '2 AI Study Modules', 'Standard Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                  <Check className="w-5 h-5 text-gray-400 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* PRO TIER */}
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border-2 border-[#2563eb] shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#2563eb] mb-2 flex items-center gap-2"><Zap className="w-5 h-5" /> Pro Track</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-[#1e3a5f]">{currencySymbol}{PRICING.PRO.price}</span>
                <span className="text-gray-500 font-medium">{PRICING.PRO.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Unlimited prep for a single certification.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited Adaptive Tests', 'Unlimited Study Modules', 'Deep Performance Analytics', 'Targeted Weakness Remediation', 'Priority Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                  <Check className="w-5 h-5 text-[#2563eb] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade('PRO')}
              disabled={isProcessing !== null}
              className="w-full py-4 rounded-xl font-bold bg-[#2563eb] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
            >
              {isProcessing === 'PRO' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade to Pro"}
            </button>
          </motion.div>

          {/* ALL ACCESS TIER */}
          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-b from-[#1e3a5f] to-[#0f172a] rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col text-white">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-300 mb-2 flex items-center gap-2"><Crown className="w-5 h-5" /> All-Access</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{currencySymbol}{PRICING.ALL_ACCESS.price}</span>
                <span className="text-gray-400 font-medium">{PRICING.ALL_ACCESS.period}</span>
              </div>
              <p className="text-sm text-gray-400 mt-4">For ambitious multi-track learners.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Pro', 'Unlock ALL Certification Tracks', 'Early Access to New Features', '1-on-1 Exam Strategy Call', 'Enterprise SLA'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-200 font-medium">
                  <Check className="w-5 h-5 text-purple-400 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade('ALL_ACCESS')}
              disabled={isProcessing !== null}
              className="w-full py-4 rounded-xl font-bold bg-white text-[#1e3a5f] hover:bg-gray-100 shadow-lg transition-all flex justify-center items-center gap-2"
            >
               {isProcessing === 'ALL_ACCESS' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get All-Access"}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}