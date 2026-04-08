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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request from the Dashboard UI
    const body = await req.json();
    
    // 🚀 THE FIX 1: Read exactly what dashboard-client.tsx sends!
    const { certificationSlug, targetSubject, targetTopic, targetSubTopic, difficulty } = body;
    
    console.log(`Requesting study module for: ${targetSubTopic}`);

    // 🚀 THE FIX 2: Ensure the ID matches the dashboard so history links up
    const studentId = session?.user?.name ? session.user.name.split(' ')[0] : "Vishal";

    // 3. Build payload for Python app.py
    const payload = {
      action: "get_workbook",
      student_profile: {
        student_id: studentId,
        target_exam: certificationSlug || 'AWS Solutions Architect Associate',
      },
      // 🚀 THE FIX 3: Defensive Payload. We send sub_topic at the root AND in config 
      // to guarantee app.py finds it no matter how you wrote it!
      subject: targetSubject,
      topic: targetTopic,
      sub_topic: targetSubTopic,
      difficulty_level: difficulty || 3,
      workbook_config: {
        subject: targetSubject,
        topic: targetTopic,
        sub_topic: targetSubTopic,
        difficulty_level: difficulty || 3
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