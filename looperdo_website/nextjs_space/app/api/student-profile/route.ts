export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { mockStudentProfile, mockTestHistory } from '@/lib/mock-data';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: (session.user as any)?.id },
      include: { certifications: true, testHistories: { orderBy: { completedAt: 'desc' }, take: 10 } },
    });
    if (!profile) {
      return NextResponse.json({
        ...mockStudentProfile,
        testHistory: mockTestHistory,
      });
    }
    const hasCerts = (profile?.certifications?.length ?? 0) > 0;
    return NextResponse.json({
      readinessScore: hasCerts ? profile.readinessScore : mockStudentProfile.readinessScore,
      totalTestsTaken: profile.totalTestsTaken > 0 ? profile.totalTestsTaken : mockStudentProfile.totalTestsTaken,
      totalStudyHours: profile.totalStudyHours > 0 ? profile.totalStudyHours : mockStudentProfile.totalStudyHours,
      currentStreak: profile.currentStreak > 0 ? profile.currentStreak : mockStudentProfile.currentStreak,
      longestStreak: profile.longestStreak > 0 ? profile.longestStreak : mockStudentProfile.longestStreak,
      certifications: hasCerts
        ? (profile.certifications ?? []).map((c: any) => ({
            certificationSlug: c?.certificationSlug,
            certificationName: c?.certificationName,
            readinessScore: c?.readinessScore,
            testsCompleted: c?.testsCompleted,
            topicScores: c?.topicScores ?? {},
          }))
        : mockStudentProfile.certifications,
      testHistory: (profile?.testHistories?.length ?? 0) > 0
        ? (profile.testHistories ?? []).map((t: any) => ({
            id: t?.id,
            certificationSlug: t?.certificationSlug,
            score: t?.score,
            totalQuestions: t?.totalQuestions,
            correctAnswers: t?.correctAnswers,
            difficulty: t?.difficulty,
            completedAt: t?.completedAt?.toISOString?.() ?? '',
          }))
        : mockTestHistory,
    });
  } catch (error: any) {
    console.error('Student profile error:', error);
    return NextResponse.json({ ...mockStudentProfile, testHistory: mockTestHistory });
  }
}
