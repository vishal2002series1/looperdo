'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TopicChartInner = dynamic(() => import('./topic-chart-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
    </div>
  ),
});

export default function TopicChart({ topicScores }: { topicScores: Record<string, number> }) {
  return <TopicChartInner topicScores={topicScores} />;
}
