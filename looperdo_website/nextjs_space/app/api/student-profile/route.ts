export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the actual User from our updated schema
    let dbUser = null;
    try {
        dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
    } catch (dbError) {
        console.error("Database query failed:", dbError);
        return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
    }
    
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Return the specific business fields needed by the dashboard & onboarding
    return NextResponse.json({
      subscriptionTier: dbUser.subscriptionTier,
      unlockedExams: dbUser.unlockedExams,
      testsGenerated: dbUser.testsGenerated,
      modulesGenerated: dbUser.modulesGenerated,
      // Placeholder aesthetic stats for the dashboard top boxes (can be dynamic later)
      totalStudyHours: Math.round(dbUser.modulesGenerated * 0.5), 
      currentStreak: 1, 
      longestStreak: 1, 
    });
    
  } catch (error: any) {
    console.error('Student profile API error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}