'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Loader2, ArrowLeft } from 'lucide-react';

interface PricingProps {
  countryCode: string;
  currentTier: string;
  pricingData: {
    currencySymbol: string;
    proPrice: string;
    allAccessPrice: string;
  };
}

export default function PricingClient({ countryCode, currentTier, pricingData }: PricingProps) {
  const router = useRouter();
  const { update } = useSession();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const PRICING = {
    FREE: { price: '0', period: '/forever' },
    PRO: { price: pricingData.proPrice, period: '/month' },
    ALL_ACCESS: { price: pricingData.allAccessPrice, period: '/month' }
  };

  const handleUpgrade = async (tier: string) => {
    setIsProcessing(tier);
    try {
      // 🚀 Point this to our new checkout API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier })
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        // 🚀 Redirect the user to Dodo's secure hosted payment page!
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to initiate checkout.");
        setIsProcessing(null);
      }
    } catch (e) {
      console.error(e);
      alert("Network error during checkout.");
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
                <span className="text-4xl font-black text-[#1e3a5f]">{pricingData.currencySymbol}{PRICING.FREE.price}</span>
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
            {currentTier === 'FREE' ? (
                <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
                  Current Plan
                </button>
            ) : (
                <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100">
                  Included
                </button>
            )}
          </div>

          {/* PRO TIER */}
          <motion.div whileHover={{ y: -5 }} className={`bg-white rounded-3xl p-8 border-2 shadow-xl flex flex-col relative overflow-hidden ${currentTier === 'PRO' ? 'border-green-500' : 'border-[#2563eb]'}`}>
            {currentTier !== 'PRO' && <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>}
            <div className="mb-8">
              <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${currentTier === 'PRO' ? 'text-green-600' : 'text-[#2563eb]'}`}><Zap className="w-5 h-5" /> Pro Track</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-[#1e3a5f]">{pricingData.currencySymbol}{PRICING.PRO.price}</span>
                <span className="text-gray-500 font-medium">{PRICING.PRO.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Unlimited prep for a single certification.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited Adaptive Tests', 'Unlimited Study Modules', 'Deep Performance Analytics', 'Targeted Weakness Remediation', 'Priority Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                  <Check className={`w-5 h-5 shrink-0 ${currentTier === 'PRO' ? 'text-green-500' : 'text-[#2563eb]'}`} /> {feature}
                </li>
              ))}
            </ul>
            {currentTier === 'PRO' ? (
                 <button disabled className="w-full py-4 rounded-xl font-bold bg-green-50 text-green-600 border border-green-200 cursor-not-allowed flex justify-center items-center gap-2">
                    <Check className="w-5 h-5" /> Active Plan
                 </button>
            ) : currentTier === 'ALL_ACCESS' ? (
                 <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100">
                  Included in All-Access
                </button>
            ) : (
                <button 
                  onClick={() => handleUpgrade('PRO')}
                  disabled={isProcessing !== null}
                  className="w-full py-4 rounded-xl font-bold bg-[#2563eb] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
                >
                  {isProcessing === 'PRO' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade to Pro"}
                </button>
            )}
          </motion.div>

          {/* ALL ACCESS TIER */}
          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-b from-[#1e3a5f] to-[#0f172a] rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col text-white">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-300 mb-2 flex items-center gap-2"><Crown className="w-5 h-5" /> All-Access</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{pricingData.currencySymbol}{PRICING.ALL_ACCESS.price}</span>
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
            {currentTier === 'ALL_ACCESS' ? (
                 <button disabled className="w-full py-4 rounded-xl font-bold bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-not-allowed flex justify-center items-center gap-2">
                    <Check className="w-5 h-5" /> Active Plan
                 </button>
            ) : (
                <button 
                  onClick={() => handleUpgrade('ALL_ACCESS')}
                  disabled={isProcessing !== null}
                  className="w-full py-4 rounded-xl font-bold bg-white text-[#1e3a5f] hover:bg-gray-100 shadow-lg transition-all flex justify-center items-center gap-2"
                >
                   {isProcessing === 'ALL_ACCESS' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get All-Access"}
                </button>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}