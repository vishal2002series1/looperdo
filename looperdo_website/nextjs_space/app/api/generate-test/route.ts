import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';
export const maxDuration = 900; // Allow this route to run for up to 5 minutes (300 seconds)

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the request from your Next.js frontend
    const body = await req.json();
    const { certificationSlug, difficulty, questionCount } = body ?? {};
    
    const count = questionCount ?? 5;
    const targetExam = certificationSlug ?? 'UPSC';

    // 3. Build payload strictly matching your Python app.py & schema.py 'generate' action
    const payload = {
      action: "generate",
      student_profile: {
        student_id: session.user.id,
        target_exam: targetExam,
      },
      test_config: {
        target_subject: "All Syllabus", 
        target_topic: "All Syllabus",
        num_questions: count,
        adaptive_mode: true,
        // Map frontend string difficulty to backend integer, or leave null for Auto/Adaptive mode
        target_difficulty: typeof difficulty === 'number' ? difficulty : null, 
      }
    };

    // 4. Send the request to your AWS Lambda AI Engine
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) {
      throw new Error("AWS_LAMBDA_URL is missing in .env");
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      console.error("Lambda Generate Error:", errorText);
      return NextResponse.json({ error: "Failed to generate test from AI backend" }, { status: 500 });
    }

    let rawResponseText = await lambdaResponse.text();
    let aiData: any = {};

    try {
        // 1. First parse: Convert the raw response text into a JSON object
        const parsedResponse = JSON.parse(rawResponseText);
        
        // 2. Second parse: The actual data is inside the stringified 'body' property
        if (parsedResponse && typeof parsedResponse.body === 'string') {
            aiData = JSON.parse(parsedResponse.body);
        } else if (parsedResponse && parsedResponse.questions) {
             // In case it wasn't wrapped in a 'body' string
            aiData = parsedResponse;
        } else {
             aiData = parsedResponse;
        }

    } catch (e) {
        console.error("Failed to aggressively parse Lambda response:", e);
        console.error("Raw response was:", rawResponseText);
        return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }

    console.log("Successfully extracted AI Data Questions Count:", aiData.questions?.length);

    // 5. Return the array of Question objects along with frontend-expected metadata
    return NextResponse.json({
      testId: `test_${Date.now()}`, 
      certificationSlug: targetExam,
      difficulty: difficulty ?? 'adaptive',
      questions: aiData.questions || [], 
      timeLimit: count * 90, 
      sessionRestored: aiData.session_restored 
    });

  } catch (error: any) {
    console.error('Generate test error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}