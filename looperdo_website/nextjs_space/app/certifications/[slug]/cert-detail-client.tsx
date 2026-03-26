'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FileText, Target, BarChart3, BookOpen, CheckCircle2 } from 'lucide-react';
import SectionReveal from '@/components/section-reveal';
import type { Certification } from '@/lib/certifications';

export default function CertDetailClient({ cert }: { cert: Certification }) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            <div className="relative w-24 h-24 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={cert?.image ?? ''} alt={cert?.name ?? 'Certification'} fill className="object-contain p-2" />
            </div>
            <div>
              <p className="text-[#60b5ff] text-sm font-medium mb-1">{cert?.provider ?? ''}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{cert?.name ?? ''}</h1>
              <p className="text-blue-100/80 max-w-2xl">{cert?.examDetails ?? ''}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Exam Details */}
      <section className="bg-white py-12 border-b">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Target, label: 'Difficulty', value: cert?.difficulty ?? '' },
              { icon: BarChart3, label: 'Passing Score', value: cert?.passingScore ?? '' },
              { icon: Clock, label: 'Duration', value: cert?.examDuration ?? '' },
              { icon: FileText, label: 'Questions', value: cert?.questionCount ?? '' },
            ].map((item: any, i: number) => {
              const Icon = item?.icon ?? Target;
              return (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 mx-auto text-[#2563eb] mb-2" />
                    <p className="text-xs text-gray-400 mb-1">{item?.label ?? ''}</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">{item?.value ?? ''}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="bg-gray-50/50 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Topics Covered</h2>
              <p className="text-gray-500 mt-2">Master every domain with LooperDo&apos;s adaptive testing and personalized workbooks.</p>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {(cert?.topics ?? []).map((topic: string, i: number) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#1e3a5f]">{topic ?? ''}</span>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How LooperDo Helps */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">How LooperDo prepares you</h2>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: FileText, title: 'Adaptive Tests', desc: 'Questions scaled to your level that never repeat, covering all exam domains.' },
              { icon: BarChart3, title: 'Gap Analysis', desc: 'Detailed per-topic proficiency tracking shows exactly where you need to improve.' },
              { icon: BookOpen, title: 'Study Workbooks', desc: 'Personalized theory, tricks, mind maps, and practice questions for weak areas.' },
            ].map((item: any, i: number) => {
              const Icon = item?.icon ?? FileText;
              return (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Icon className="w-8 h-8 mx-auto text-[#2563eb] mb-3" />
                    <h3 className="text-base font-bold text-[#1e3a5f] mb-2">{item?.title ?? ''}</h3>
                    <p className="text-sm text-gray-500">{item?.desc ?? ''}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your {cert?.shortName ?? ''} journey?</h2>
            <p className="text-blue-100/80 mb-8 max-w-lg mx-auto">
              Join LooperDo and know exactly when you&apos;re ready to pass the {cert?.name ?? ''} exam.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#1e3a5f] font-bold rounded-md hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Preparing Now <ArrowRight className="w-4 h-4" />
            </Link>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
