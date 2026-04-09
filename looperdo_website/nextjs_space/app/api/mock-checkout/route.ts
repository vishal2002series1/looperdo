import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tier, track } = body;

    let unlockedExams: string[] = [];
    if (tier === "PRO" && track) {
        unlockedExams = [track];
    } else if (tier === "ALL_ACCESS") {
        // Unlock everything
        unlockedExams = [
            "AWS Solutions Architect Associate", 
            "Microsoft Azure Administrator (AZ-104)", 
            "Google Cloud Associate Cloud Engineer", 
            "Microsoft Power BI Data Analyst (PL-300)", 
            "Lean Six Sigma Black Belt (IASSC)", 
            "PMI Project Management Professional (PMP)"
        ];
    }

    await db.user.update({
      where: { email: session.user.email },
      data: { 
          subscriptionTier: tier,
          unlockedExams: unlockedExams
      }
    });

    return NextResponse.json({ success: true, message: `Successfully upgraded to ${tier}` });
  } catch (error: any) {
    console.error("Mock Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process upgrade" }, { status: 500 });
  }
}