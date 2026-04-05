import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';
export const maxDuration = 900; 

export async function POST(req: Request) {
  console.log("=== BRAND NEW MODULE GENERATOR HIT ===");
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request from the Results UI
    const body = await req.json();
    const { subject, topic, sub_topic, difficulty_level, target_exam } = body;
    
    console.log(`Requesting study module for: ${sub_topic}`);

    // 3. Build payload for Python app.py
    const payload = {
      action: "get_workbook",
      student_profile: {
        student_id: session.user.id,
        target_exam: target_exam || 'UPSC',
      },
      workbook_config: {
        subject: subject,
        topic: topic,
        sub_topic: sub_topic,
        difficulty_level: parseInt(difficulty_level) || 3
      }
    };

    // 4. Hit the AWS Lambda Function URL
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) throw new Error("AWS_LAMBDA_URL is missing in .env");

    console.log("Pinging AWS Lambda Engine...");

    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: 'no-store' // STRICTLY prevent Next.js from caching this POST
    });

    if (!lambdaResponse.ok) {
        const errText = await lambdaResponse.text();
        console.error("AWS Lambda Error:", errText);
        return NextResponse.json({ error: `AWS Error: ${errText}` }, { status: 500 });
    }

    // 5. Parse Aggressively
    const rawResponseText = await lambdaResponse.text();
    console.log("Raw Response received:", rawResponseText.substring(0, 100) + "...");

    let parsed: any = null;
    try {
        parsed = JSON.parse(rawResponseText);
        if (parsed && typeof parsed.body === 'string') {
             parsed = JSON.parse(parsed.body);
        }
        if (parsed && typeof parsed.workbook === 'string') {
             parsed.workbook = JSON.parse(parsed.workbook);
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return NextResponse.json({ error: "Failed to parse JSON from AI." }, { status: 500 });
    }

    if (!parsed || !parsed.workbook) {
         return NextResponse.json({ error: "No workbook data found in the AI response." }, { status: 500 });
    }

    console.log("=== MODULE GENERATION SUCCESS ===");
    return NextResponse.json({
      success: true,
      workbook: parsed.workbook
    });

  } catch (error: any) {
    console.error("=== SERVER CATCH BLOCK ===", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}