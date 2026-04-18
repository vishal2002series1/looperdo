import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
// export const maxDuration = 9;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { certification, questions, student_answers } = body;

    if (!certification || !questions || !student_answers) {
      return NextResponse.json({ 
        error: "Missing test data. Require certification, questions, and student_answers." 
      }, { status: 400 });
    }

    // 🚀 THE FIX: Match student_id to the one used in generate & dashboard ("Vishal")
    const studentId = session.user.name ? session.user.name.split(' ')[0] : session.user.id;

    const payload = {
      action: "evaluate",
      student_profile: {
        student_id: studentId,
        target_exam: certification,
      },
      questions: questions,
      student_answers: student_answers,
    };

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

    // The user's lambda wrapper returns stringified body so we aggressively parse it like we did in generate
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
        console.error("Failed to parse evaluation response:", e);
        return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }

    const score = aiData.score_percentage || 0;
    const weakTopics = aiData.updated_profile?.weak_topics || [];
    let savedAttemptId = "temp_" + Date.now();

    try {
      if (prisma) {
        // Optional Prisma save
      }
    } catch (dbError) {
      console.warn("Could not save to Prisma DB, but returning AI results anyway:", dbError);
    }

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