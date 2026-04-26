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

    // 1. Generate token and send the verification email
    const verificationToken = await generateVerificationToken(user.email!);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    // 🚀 NEW: 2. Add user to Brevo CRM silently in the background
    if (process.env.BREVO_API_KEY) {
      try {
        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            email: user.email,
            attributes: {
              // Split the name into First and Last for cleaner CRM data
              FIRSTNAME: user.name?.split(' ')[0] || 'Student',
              LASTNAME: user.name?.split(' ').slice(1).join(' ') || ''
            },
            updateEnabled: true // If they exist, just update them rather than throwing an error
          })
        });
      } catch (brevoError) {
        console.error('Brevo CRM Sync Error:', brevoError);
        // We purposely do not return an error here so the signup still completes successfully!
      }
    }

    return NextResponse.json({ 
      message: "Account created! Please check your email to verify your account." 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 