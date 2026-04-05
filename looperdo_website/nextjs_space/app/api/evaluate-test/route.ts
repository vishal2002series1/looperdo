import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Ensure the user is actually logged in before hitting our expensive AI endpoint
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the incoming data from the frontend
    const body = await req.json();
    const { certification, questions, student_answers } = body;

    if (!certification || !questions || !student_answers) {
      return NextResponse.json({ 
        error: "Missing test data. Require certification, questions, and student_answers." 
      }, { status: 400 });
    }

    // 3. Construct the payload exactly as your Python app.py expects
    const payload = {
      action: "evaluate",
      student_profile: {
        student_id: session.user.id,
        target_exam: certification,
      },
      questions: questions,
      student_answers: student_answers,
    };

    // 4. Send to your AWS Lambda Engine
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) {
      throw new Error("AWS_LAMBDA_URL is not defined in .env");
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      console.error("Lambda Error:", errorText);
      return NextResponse.json({ error: "AI Evaluation failed" }, { status: 500 });
    }

    const aiData = await lambdaResponse.json();

    // 5. Attempt to save the result to our Neon PostgreSQL database
    const score = aiData.score_percentage || 0;
    const weakTopics = aiData.updated_profile?.weak_topics || [];
    let savedAttemptId = "temp_" + Date.now();

    try {
      if (prisma) {
        const savedAttempt = await prisma.testAttempt.create({
          data: {
            userId: session.user.id,
            certification: certification,
            score: score,
            readinessPercentage: score, 
            weakTopics: weakTopics,
          },
        });
        savedAttemptId = savedAttempt.id;
      }
    } catch (dbError) {
      console.warn("Could not save to Prisma DB, but returning AI results anyway:", dbError);
    }

    // 6. Return the AI's feedback to the frontend UI ALWAYS
    return NextResponse.json({
      success: true,
      score: score,
      study_plan: aiData.study_plan,
      graded_results: aiData.graded_results,
      savedAttemptId: savedAttemptId,
    });

  } catch (error: any) {
    console.error("Evaluation Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}