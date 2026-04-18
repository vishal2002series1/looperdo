import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma'; // <-- FIXED IMPORT

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier, track } = await req.json();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let unlockedExams = user.unlockedExams || [];
    if (track && !unlockedExams.includes(track)) {
      unlockedExams.push(track);
    }

    // Update the user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionTier: tier,
        unlockedExams: unlockedExams
      }
    });

    return NextResponse.json({ success: true, tier });

  } catch (error: any) {
    console.error('Mock Checkout Error:', error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}