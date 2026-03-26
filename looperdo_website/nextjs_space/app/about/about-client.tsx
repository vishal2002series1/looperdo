'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Repeat, BarChart3, Users, Heart } from 'lucide-react';
import SectionReveal from '@/components/section-reveal';

export default function AboutClient() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Heart className="w-10 h-10 mx-auto mb-4 text-[#60b5ff]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">About LooperDo</h1>
            <p className="text-blue-100/80 max-w-lg mx-auto">
              We believe no one should walk into an exam uncertain. LooperDo was built to replace that anxiety with data-driven confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <SectionReveal>
              <div>
                <p className="text-sm font-medium text-[#2563eb] uppercase tracking-wider mb-2">Our Mission</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">Eliminate exam-day uncertainty</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Too many professionals spend weeks studying without knowing if they&apos;re actually ready. They rely on gut feeling, generic practice tests, and hope. LooperDo changes that.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Our Exam Readiness Score is mathematically grounded, tracking proficiency across every sub-topic of your certification. When it says you&apos;re ready, you&apos;re ready.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src="https://cdn.abacus.ai/images/83c9d4c9-5fb9-419a-a8ed-fd4ad1aa9b4b.png"
                  alt="LooperDo team collaborating on adaptive exam preparation technology"
                  fill
                  className="object-cover"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50/50 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">How it works</h2>
              <p className="text-gray-500 mt-2">A continuous improvement loop that builds mastery</p>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Target, title: 'Test & Diagnose', desc: 'Take adaptive tests that pinpoint your exact knowledge gaps across every exam sub-topic.' },
              { icon: Lightbulb, title: 'Study Smart', desc: 'Get personalized workbooks with theory, tricks, mind maps, and curated video resources.' },
              { icon: Repeat, title: 'Loop & Grow', desc: 'Each cycle sharpens your readiness until the score confirms you\u2019re ready to pass.' },
            ].map((step: any, i: number) => {
              const Icon = step?.icon ?? Target;
              return (
                <SectionReveal key={i} delay={i * 0.15}>
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-[#2563eb]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{step?.title ?? ''}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step?.desc ?? ''}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">What we stand for</h2>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: BarChart3, title: 'Data Over Guesswork', desc: 'Every recommendation is backed by measurable proficiency data, not generic advice.' },
              { icon: Users, title: 'Student-Centered', desc: 'We design for the learner\u2019s success, not engagement metrics. Your readiness is our north star.' },
              { icon: Lightbulb, title: 'Continuous Improvement', desc: 'Just like our flywheel, we\u2019re always iterating to give you the best preparation experience.' },
            ].map((v: any, i: number) => {
              const Icon = v?.icon ?? BarChart3;
              return (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <Icon className="w-8 h-8 text-[#2563eb] mb-3" />
                    <h3 className="text-base font-bold text-[#1e3a5f] mb-2">{v?.title ?? ''}</h3>
                    <p className="text-sm text-gray-500">{v?.desc ?? ''}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
