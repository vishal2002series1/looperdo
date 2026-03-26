'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78', '#2563eb', '#7c3aed'];

export default function TopicChartInner({ topicScores }: { topicScores: Record<string, number> }) {
  const entries = Object.entries(topicScores ?? {});
  if (entries.length === 0) {
    return <div className="text-center text-gray-400 py-12">No topic data available yet</div>;
  }

  const data = entries.map(([topic, score]: [string, number]) => ({
    topic: topic?.length > 20 ? topic.substring(0, 18) + '...' : topic,
    fullTopic: topic,
    score: score ?? 0,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            tick={{ fontSize: 10 }}
            label={{ value: 'Score %', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <YAxis
            type="category"
            dataKey="topic"
            width={140}
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(value: any, name: any, props: any) => [`${value}%`, props?.payload?.fullTopic ?? 'Score']}
          />
          <ReferenceLine x={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Pass', fill: '#10b981', fontSize: 10, position: 'top' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
