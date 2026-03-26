'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import CertificationCard from '@/components/certification-card';
import SectionReveal from '@/components/section-reveal';
import { certifications } from '@/lib/certifications';

export default function CertificationsClient() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Award className="w-10 h-10 mx-auto mb-4 text-[#60b5ff]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Certification Tracks</h1>
            <p className="text-blue-100/80 max-w-lg mx-auto">
              Choose your certification and let LooperDo guide you from beginner to exam-ready with adaptive, data-driven preparation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="bg-gray-50/50 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(certifications ?? []).map((cert: any, i: number) => (
              <CertificationCard key={cert?.slug ?? i} cert={cert} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
