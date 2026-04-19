import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Standard security practice: don't reveal if an email exists in the system
      return NextResponse.json({ message: 'If your email is in our system, a reset link has been sent.' }, { status: 200 });
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return NextResponse.json({ message: 'Reset email sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}