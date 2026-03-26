export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { mockWorkbook } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ workbook: mockWorkbook });
  } catch (error: any) {
    console.error('Generate workbook error:', error);
    return NextResponse.json({ error: 'Failed to generate workbook' }, { status: 500 });
  }
}
