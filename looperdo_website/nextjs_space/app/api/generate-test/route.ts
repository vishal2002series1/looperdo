export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { mockTestQuestions } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { certificationSlug, difficulty, questionCount } = body ?? {};
    const count = questionCount ?? 5;
    const questions = (mockTestQuestions ?? []).slice(0, count).map((q: any, i: number) => ({
      ...q,
      id: `q${i + 1}`,
      difficulty: difficulty ?? q?.difficulty ?? 'medium',
    }));
    return NextResponse.json({
      testId: `test_${Date.now()}`,
      certificationSlug: certificationSlug ?? 'aws-saa',
      difficulty: difficulty ?? 'adaptive',
      questions,
      timeLimit: count * 90,
    });
  } catch (error: any) {
    console.error('Generate test error:', error);
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
  }
}
