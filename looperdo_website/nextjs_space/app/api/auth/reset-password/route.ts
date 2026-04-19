import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });

    const existingToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!existingToken) return NextResponse.json({ error: 'Invalid token!' }, { status: 400 });

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return NextResponse.json({ error: 'Token has expired!' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email: existingToken.email } });
    if (!existingUser) return NextResponse.json({ error: 'Email does not exist!' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    return NextResponse.json({ message: 'Password updated successfully!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}