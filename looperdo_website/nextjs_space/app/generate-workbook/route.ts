import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';
export const maxDuration = 900; 

export async function POST(req: Request) {
  console.log("=== WORKBOOK GENERATION STARTED ===");
  try {
    // 1. Authenticate
    console.log("1. Checking session...");
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Session failed or no user ID.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    console.log("2. Parsing request body...");
    const body = await req.json();
    const { subject, topic, sub_topic, difficulty_level, target_exam } = body;
    console.log("Received data:", { subject, topic, sub_topic, difficulty_level, target_exam });

    // 3. Build payload
    console.log("3. Building payload...");
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

    // 4. Hit the AWS Lambda
    console.log("4. Fetching AWS URL from ENV...");
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) {
      console.error("CRITICAL: AWS_LAMBDA_URL is undefined!");
      throw new Error("AWS_LAMBDA_URL is missing in .env");
    }
    
    console.log(`Sending fetch request to: ${lambdaUrl}`);

    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log(`Fetch returned status: ${lambdaResponse.status}`);

    if (!lambdaResponse.ok) {
        const errText = await lambdaResponse.text();
        console.error("Lambda HTTP Error:", errText);
        return NextResponse.json({ error: `Lambda Error: ${errText}` }, { status: 500 });
    }

    // 5. Parse
    console.log("5. Parsing Lambda Response...");
    const rawResponseText = await lambdaResponse.text();
    
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
        console.error("JSON Parsing Error:", e);
        return NextResponse.json({ error: "Failed to parse Lambda JSON." }, { status: 500 });
    }

    if (!parsed || !parsed.workbook) {
         console.error("Final parsed object missing 'workbook' key:", parsed);
         return NextResponse.json({ error: "AI processed the request, but returned no workbook data." }, { status: 500 });
    }

    console.log("=== WORKBOOK GENERATION SUCCESS ===");
    return NextResponse.json({
      success: true,
      workbook: parsed.workbook
    });

  } catch (error: any) {
    console.error("=== CRITICAL CATCH BLOCK ===");
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}