'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Certification } from '@/lib/certifications';

export default function CertificationCard({ cert, index }: { cert: Certification; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/certifications/${cert?.slug ?? ''}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full group border border-gray-100 hover:border-[#2563eb]/20">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={cert?.image ?? '/images/aws-saa.png'}
                alt={cert?.name ?? 'Certification'}
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2563eb] mb-1">{cert?.provider ?? ''}</p>
              <h3 className="text-base font-bold text-[#1e3a5f] mb-1 group-hover:text-[#2563eb] transition-colors">
                {cert?.name ?? ''}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">{cert?.description ?? ''}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-3">
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{cert?.difficulty ?? ''}</span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{cert?.questionCount ?? ''}</span>
            </div>
            <span className="text-sm font-medium text-[#2563eb] flex items-center gap-1 group-hover:gap-2 transition-all">
              Start <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
