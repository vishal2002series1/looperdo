import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, target_exam } = body;

    if (!student_id || !target_exam) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 🚀 Using .env variable instead of hardcoded URL
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) {
      throw new Error("AWS_LAMBDA_URL is missing in .env");
    }

    const awsResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", 
      body: JSON.stringify({
        action: "get_progress_tree",
        student_profile: {
          student_id: student_id,
          target_exam: target_exam
        }
      })
    });

    const data = await awsResponse.json();

    if (!awsResponse.ok) {
      throw new Error(data.message || "Failed to fetch progress from AWS");
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}