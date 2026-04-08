import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json({ error: "Missing student_id parameter" }, { status: 400 });
    }

    // Cache-busting URL
    const lambdaUrl = `${process.env.AWS_LAMBDA_URL}?t=${Date.now()}`;

    const awsResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", 
      body: JSON.stringify({
        action: "get_history",
        student_profile: {
          student_id: student_id
        }
      })
    });

    const data = await awsResponse.json();

    if (!awsResponse.ok) {
      throw new Error(data.message || "Failed to fetch history from AWS");
    }

    return NextResponse.json({ success: true, history: data.history || [] });

  } catch (error: any) {
    console.error("History API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}