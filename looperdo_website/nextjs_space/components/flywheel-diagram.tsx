'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, PenTool, Brain, BookOpen, RefreshCw, Trophy } from 'lucide-react';

const steps = [
  { icon: FileText, label: 'Generate Test', desc: 'Adaptive, never-repeat questions', color: '#2563eb' },
  { icon: PenTool, label: 'Take Test', desc: 'Timed, exam-like conditions', color: '#7c3aed' },
  { icon: Brain, label: 'AI Diagnosis', desc: 'Pinpoint knowledge gaps', color: '#dc2626' },
  { icon: BookOpen, label: 'Study Workbook', desc: 'Theory, tricks, practice', color: '#ea580c' },
  { icon: RefreshCw, label: 'Repeat Cycle', desc: 'Score climbs each loop', color: '#0891b2' },
  { icon: Trophy, label: 'Ready to Pass', desc: 'Confidence backed by data', color: '#10b981' },
];

export default function FlywheelDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="relative">
      {/* Desktop: circular layout */}
      <div className="hidden md:block">
        <div className="relative w-[500px] h-[500px] mx-auto">
          {/* Center circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center shadow-lg z-10"
          >
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-white mx-auto mb-1" />
              <span className="text-white text-xs font-bold">The Loop</span>
            </div>
          </motion.div>

          {/* Steps around the circle */}
          {steps.map((step: any, i: number) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x = 250 + 190 * Math.cos(angle) - 60;
            const y = 250 + 190 * Math.sin(angle) - 60;
            const Icon = step?.icon ?? FileText;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * i + 0.5 }}
                className="absolute w-[120px]"
                style={{ left: x, top: y }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md mb-2"
                    style={{ backgroundColor: `${step?.color ?? '#2563eb'}15`, border: `2px solid ${step?.color ?? '#2563eb'}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step?.color ?? '#2563eb' }} />
                  </div>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{step?.label ?? ''}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{step?.desc ?? ''}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Connecting arrows - SVG */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
              </marker>
            </defs>
            {steps.map((_: any, i: number) => {
              const a1 = (i * 60 - 90) * (Math.PI / 180);
              const a2 = (((i + 1) % 6) * 60 - 90) * (Math.PI / 180);
              const r = 155;
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={250 + r * Math.cos(a1)}
                  y1={250 + r * Math.sin(a1)}
                  x2={250 + r * Math.cos(a2)}
                  y2={250 + r * Math.sin(a2)}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i + 0.8 }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden flex flex-col gap-4">
        {steps.map((step: any, i: number) => {
          const Icon = step?.icon ?? FileText;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${step?.color ?? '#2563eb'}15`, border: `2px solid ${step?.color ?? '#2563eb'}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: step?.color ?? '#2563eb' }} />
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-[#1e3a5f]">{step?.label ?? ''}</p>
                <p className="text-xs text-gray-500">{step?.desc ?? ''}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
