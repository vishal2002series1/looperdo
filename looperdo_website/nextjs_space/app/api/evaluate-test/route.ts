export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { mockDiagnosis } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testId, answers } = body ?? {};
    return NextResponse.json({
      testId: testId ?? 'test_mock',
      diagnosis: mockDiagnosis,
      updatedReadinessScore: 78,
      previousReadinessScore: 75,
      improvement: 3,
    });
  } catch (error: any) {
    console.error('Evaluate test error:', error);
    return NextResponse.json({ error: 'Failed to evaluate test' }, { status: 500 });
  }
}
