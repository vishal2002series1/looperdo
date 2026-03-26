'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import SectionReveal from '@/components/section-reveal';

const faqs = [
  {
    q: 'What is the Exam Readiness Score?',
    a: 'The Exam Readiness Score is a mathematically grounded metric that tracks your proficiency across every sub-topic of your certification exam. Unlike simple percentage scores, it accounts for topic weights, difficulty progression, and consistency over time. When your score reaches 95-100%, our data shows a very high correlation with passing the actual exam.',
  },
  {
    q: 'How does adaptive testing work?',
    a: 'Our adaptive engine analyzes your performance history and adjusts question difficulty in real-time. If you consistently answer networking questions correctly, the system increases difficulty in that area while focusing easier questions on your weaker topics. The system never repeats questions, ensuring every test is a fresh challenge.',
  },
  {
    q: 'What are personalized workbooks?',
    a: 'After each test, LooperDo generates a custom study workbook targeting your specific weak areas. Each workbook includes concise theory explanations, memory tricks, mind maps, curated YouTube tutorials, and practice questions — all tailored to close your knowledge gaps.',
  },
  {
    q: 'Which certifications do you support?',
    a: 'We currently support AWS Solutions Architect Associate (SAA-C03), Lean Six Sigma Black Belt (IASSC), Microsoft Azure Administrator (AZ-104), Power BI Data Analyst (PL-300), Google Cloud Associate Cloud Engineer, and PMP. More certifications are added regularly.',
  },
  {
    q: 'Can I switch certification tracks?',
    a: 'With the All-Access plan, you can prepare for multiple certifications simultaneously. Free and Pro plans are limited to one certification track, but you can switch your active certification at any time.',
  },
  {
    q: 'How is LooperDo different from other practice test platforms?',
    a: 'Most platforms give you a percentage score and call it done. LooperDo tracks per sub-topic proficiency, adapts difficulty to your level, generates personalized study materials, and provides a mathematically meaningful Exam Readiness Score that correlates with actual exam outcomes. It is a complete learning loop, not just practice tests.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! The Free plan gives you access to one certification with 3 adaptive tests per month, forever. When you are ready for unlimited tests and personalized workbooks, upgrade to Pro or All-Access.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel your Pro or All-Access subscription at any time. Your access continues until the end of your current billing period, and you can always downgrade to the Free plan.',
  },
];

function FaqItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <SectionReveal delay={index * 0.05}>
      <div className="border-b border-gray-100">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-5 text-left group"
        >
          <span className="text-sm font-semibold text-[#1e3a5f] group-hover:text-[#2563eb] transition-colors pr-4">
            {faq?.q ?? ''}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-500 leading-relaxed pb-5">{faq?.a ?? ''}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionReveal>
  );
}

export default function FaqClient() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle className="w-10 h-10 mx-auto mb-4 text-[#60b5ff]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
            <p className="text-blue-100/80 max-w-lg mx-auto">Find answers to common questions about LooperDo and exam preparation.</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[700px] px-4">
          {faqs.map((faq: any, i: number) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
