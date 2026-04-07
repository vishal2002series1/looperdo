import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';
export const maxDuration = 900; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // 🚀 THE FIX: Extract targetDomain and targetTopic from the dashboard request
    const { certificationSlug, difficulty, questionCount, targetDomain, targetTopic } = body ?? {};
    
    const count = questionCount ?? 5;
    const targetExam = certificationSlug ?? 'UPSC';

    // 🚀 THE FIX: Force student_id to match the dashboard ("Vishal") instead of UUID
    const studentId = session.user.name ? session.user.name.split(' ')[0] : session.user.id;

    const payload = {
      action: "generate",
      student_profile: {
        student_id: studentId,
        target_exam: targetExam,
      },
      test_config: {
        // Pass the exact clicked taxonomy, fallback to All Syllabus for full exams
        target_subject: targetDomain || "All Syllabus", 
        target_topic: targetTopic || "All Syllabus",
        // Force the AWS AI to strictly evaluate only this topic if provided
        override_topics: targetTopic ? [targetTopic] : [],
        num_questions: count,
        adaptive_mode: true,
        target_difficulty: typeof difficulty === 'number' ? difficulty : null, 
      }
    };

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
        const parsedResponse = JSON.parse(rawResponseText);
        if (parsedResponse && typeof parsedResponse.body === 'string') {
            aiData = JSON.parse(parsedResponse.body);
        } else if (parsedResponse && parsedResponse.questions) {
            aiData = parsedResponse;
        } else {
             aiData = parsedResponse;
        }
    } catch (e) {
        console.error("Failed to aggressively parse Lambda response:", e);
        return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }

    console.log("Successfully extracted AI Data Questions Count:", aiData.questions?.length);

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