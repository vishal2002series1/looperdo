import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // 🚀 FIX: Changed user.hashedPassword to user.password
    if (!user?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 🚀 FIX: Changed user.hashedPassword to user.password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}