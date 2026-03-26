'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ReadinessGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

export default function ReadinessGauge({ score, size = 200, label = 'Exam Readiness', showLabel = true }: ReadinessGaugeProps) {
  const safeScore = Math.min(100, Math.max(0, score ?? 0));
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    let start: number | null = null;
    const duration = 2000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * safeScore));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, safeScore]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius * 0.75;
  const offset = circumference - (displayScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#2563eb';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${2 * Math.PI * radius * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(displayScore)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${2 * Math.PI * radius * 0.25}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold"
          fill={getColor(displayScore)}
          fontSize={size * 0.22}
        >
          {displayScore}%
        </text>
        {showLabel && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6b7280"
            fontSize={size * 0.07}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
