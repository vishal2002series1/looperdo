import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { SUBSCRIPTION_CONFIG } from '@/lib/tier-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 900; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { certificationSlug, difficulty, questionCount, targetDomain, targetTopic } = body ?? {};
    
    // --- 🚀 GATEKEEPER LOGIC START ---
    const userEmail = session.user.email;
    if (!userEmail) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) return NextResponse.json({ error: "User not found in database" }, { status: 404 });

    const tier = dbUser.subscriptionTier as keyof typeof SUBSCRIPTION_CONFIG;
    const config = SUBSCRIPTION_CONFIG[tier] || SUBSCRIPTION_CONFIG.FREE;
    const isTopicTest = !!targetTopic || !!targetDomain;

    const maxAllowed = isTopicTest ? config.maxTopicTests : config.maxFullAdaptiveTests;

    if (dbUser.testsGenerated >= maxAllowed) {
      return NextResponse.json({ 
          error: "PAYWALL_HIT", 
          message: `You have exhausted your free trial. Upgrade to unlock unlimited adaptive testing.` 
      }, { status: 403 });
    }
    // --- GATEKEEPER LOGIC END ---

    const count = questionCount ?? 5;
    const targetExam = certificationSlug ?? 'UPSC';
    const studentId = session.user.name ? session.user.name.split(' ')[0] : session.user.id;

    const payload = {
      action: "generate",
      student_profile: {
        student_id: studentId,
        target_exam: targetExam,
      },
      test_config: {
        target_subject: targetDomain || "All Syllabus", 
        target_topic: targetTopic || "All Syllabus",
        override_topics: targetTopic ? [targetTopic] : [],
        num_questions: count,
        adaptive_mode: true,
        target_difficulty: typeof difficulty === 'number' ? difficulty : null, 
      }
    };

    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) throw new Error("AWS_LAMBDA_URL is missing in .env");

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

    // --- 🚀 UPDATE USAGE IF SUCCESSFUL ---
    await prisma.user.update({
        where: { email: userEmail },
        data: { testsGenerated: dbUser.testsGenerated + 1 }
    });

    let rawResponseText = await lambdaResponse.text();
    let aiData: any = {};

    try {
        const parsedResponse = JSON.parse(rawResponseText);
        if (parsedResponse && typeof parsedResponse.body === 'string') {
            aiData = JSON.parse(parsedResponse.body);
        } else {
             aiData = parsedResponse;
        }
    } catch (e) {
        console.error("Failed to parse Lambda response:", e);
        return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }

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