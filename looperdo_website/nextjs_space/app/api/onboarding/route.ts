import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, exam } = await req.json();
    if (!email || !exam) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await prisma.user.update({
      where: { email },
      data: { unlockedExams: [exam] } // Grant them their free track!
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to set up account" }, { status: 500 });
  }
}