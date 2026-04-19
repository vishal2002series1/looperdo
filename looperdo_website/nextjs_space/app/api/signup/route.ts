export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: { 
        name: name ?? '', 
        email, 
        password: hashedPassword,
        subscriptionTier: "FREE",
        unlockedExams: [],
        testsGenerated: 0,
        modulesGenerated: 0,
      },
    });

    // 🚀 FIX: Generate token and send the verification email via Hostinger SMTP
    const verificationToken = await generateVerificationToken(user.email!);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    // 🚀 FIX: Return a success message instead of auto-logging them in
    return NextResponse.json({ 
      message: "Account created! Please check your email to verify your account." 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}