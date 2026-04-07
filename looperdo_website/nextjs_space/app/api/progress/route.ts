import { NextResponse } from 'next/server';

// 🚀 CRITICAL: Tell Next.js NEVER to cache this API route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, target_exam } = body;

    if (!student_id || !target_exam) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Call your AWS Lambda backend
    const awsResponse = await fetch("https://2e7o2dai4vbtqzvs7x7qtcwuni0cqrim.lambda-url.us-east-1.on.aws/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // 🚀 CRITICAL: Tell the fetch API to bypass cache
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