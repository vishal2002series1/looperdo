'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Repeat, BarChart3, BookOpen, ShieldCheck, Users, Star, CheckCircle2 } from 'lucide-react';
import ReadinessGauge from '@/components/readiness-gauge';
import FlywheelDiagram from '@/components/flywheel-diagram';
import AnimatedCounter from '@/components/animated-counter';
import SectionReveal from '@/components/section-reveal';
import CertificationCard from '@/components/certification-card';
import { certifications } from '@/lib/certifications';

const benefits = [
  { icon: Repeat, title: 'Never Repeat Questions', desc: 'Every test is unique. Our adaptive engine ensures you always face fresh questions tailored to your level.' },
  { icon: Target, title: 'Adaptive Difficulty', desc: 'Questions automatically scale to your proficiency. Too easy? We challenge you. Struggling? We build you up.' },
  { icon: BarChart3, title: 'Per Sub-Topic Tracking', desc: 'See exactly where you excel and where you need work. Granular proficiency data across every exam domain.' },
  { icon: BookOpen, title: 'Personalized Workbooks', desc: 'Get custom study materials with theory, mind maps, tricks, and practice questions for your weak areas.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'AWS SAA Certified', text: 'LooperDo told me I was at 94% readiness. I took the exam and passed with flying colors. The score was spot-on.', rating: 5 },
  { name: 'Marcus Johnson', role: 'PMP Certified', text: 'The workbooks are incredible. They pinpointed exactly what I needed to study. No wasted time on topics I already knew.', rating: 5 },
  { name: 'Elena Rodriguez', role: 'Azure AZ-104 Certified', text: 'I failed my first attempt before finding LooperDo. The flywheel approach got my readiness to 96% and I passed easily.', rating: 5 },
];

const stats = [
  { value: 95, suffix: '%', label: 'Pass Rate' },
  { value: 12000, suffix: '+', label: 'Students' },
  { value: 6, suffix: '', label: 'Certifications' },
  { value: 50000, suffix: '+', label: 'Tests Taken' },
];

export default function LandingClient() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f33] via-[#1e3a5f] to-[#1e3a5f] text-white">
        <div className="absolute inset-0">
          <Image
            src="https://cdn.abacus.ai/images/679c5230-87ca-4beb-915e-bc36fe1e2606.png"
            alt="Abstract professional background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#60b5ff] font-medium text-sm uppercase tracking-wider mb-4">Adaptive Exam Preparation</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-tight mb-6">
                Know <span className="text-[#60b5ff]">exactly</span> when you&apos;re ready to pass
              </h1>
              <p className="text-lg text-blue-100/80 mb-8 max-w-lg leading-relaxed">
                Stop guessing if you&apos;re prepared. LooperDo&apos;s Exam Readiness Score tracks your proficiency across every sub-topic and tells you precisely when it&apos;s time to book your exam.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#3b82f6] text-white font-semibold rounded-md transition-colors shadow-lg shadow-blue-900/30"
                >
                  Start Preparing Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/certifications"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors backdrop-blur-sm"
                >
                  Explore Certifications
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                <ReadinessGauge score={96} size={240} label="Ready to Pass!" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#10b981]">A+</p>
                    <p className="text-xs text-blue-200/70">IAM & Security</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#2563eb]">B+</p>
                    <p className="text-xs text-blue-200/70">Networking</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: any, i: number) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">
                    <AnimatedCounter end={stat?.value ?? 0} suffix={stat?.suffix ?? ''} />
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat?.label ?? ''}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-[#2563eb] uppercase tracking-wider mb-2">Why LooperDo</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Preparation that actually works</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">Every feature is designed around one goal: getting you from uncertain to exam-ready.</p>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b: any, i: number) => {
              const Icon = b?.icon ?? Target;
              return (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563eb]/20 transition-colors">
                        <Icon className="w-6 h-6 text-[#2563eb]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1e3a5f] mb-1">{b?.title ?? ''}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{b?.desc ?? ''}</p>
                      </div>
                    </div>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flywheel Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-[#2563eb] uppercase tracking-wider mb-2">The LooperDo Method</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">The Flywheel that gets you certified</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">A continuous loop of testing, diagnosis, and targeted study that builds your readiness with every cycle.</p>
            </div>
          </SectionReveal>
          <FlywheelDiagram />
        </div>
      </section>

      {/* Certifications Preview */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-[#2563eb] uppercase tracking-wider mb-2">Supported Certifications</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Prepare for top industry certifications</h2>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(certifications ?? []).map((cert: any, i: number) => (
              <CertificationCard key={cert?.slug ?? i} cert={cert} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/certifications"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] hover:bg-[#2563eb] text-white font-semibold rounded-md transition-colors"
            >
              View All Certifications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <SectionReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-[#2563eb] uppercase tracking-wider mb-2">Success Stories</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Trusted by certification achievers</h2>
            </div>
          </SectionReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t?.rating ?? 5 }).map((_: any, j: number) => (
                      <Star key={j} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t?.text ?? ''}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#2563eb]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1e3a5f]">{t?.name ?? ''}</p>
                      <p className="text-xs text-gray-400">{t?.role ?? ''}</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white py-20">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <SectionReveal>
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#60b5ff]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to know when you&apos;re ready?</h2>
            <p className="text-blue-100/80 max-w-lg mx-auto mb-8">
              Join thousands of professionals who passed their certification exams with confidence. Start your journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#1e3a5f] font-bold rounded-md hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Free Today <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-md hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                View Pricing
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
