import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { SUBSCRIPTION_CONFIG } from '@/lib/tier-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 700; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { certificationSlug, targetSubject, targetTopic, targetSubTopic, difficulty } = body;
    
    // --- 🚀 GATEKEEPER LOGIC START ---
    const userEmail = session.user.email;
    if (!userEmail) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) return NextResponse.json({ error: "User not found in database" }, { status: 404 });

    const tier = dbUser.subscriptionTier as keyof typeof SUBSCRIPTION_CONFIG;
    const config = SUBSCRIPTION_CONFIG[tier] || SUBSCRIPTION_CONFIG.FREE;

    if (dbUser.modulesGenerated >= config.maxStudyModules) {
      return NextResponse.json({ 
          error: "PAYWALL_HIT", 
          message: `You have exhausted your free study modules. Upgrade to unlock unlimited AI Workbooks.` 
      }, { status: 403 });
    }
    // --- GATEKEEPER LOGIC END ---

    const studentId = session?.user?.name ? session.user.name.split(' ')[0] : "Vishal";

    const payload = {
      action: "get_workbook",
      student_profile: {
        student_id: studentId,
        target_exam: certificationSlug || 'AWS Solutions Architect Associate',
      },
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

    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    if (!lambdaUrl) throw new Error("AWS_LAMBDA_URL is missing in .env");

    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!lambdaResponse.ok) {
        const errText = await lambdaResponse.text();
        console.error("AWS Lambda Error:", errText);
        return NextResponse.json({ error: `AWS Error: ${errText}` }, { status: 500 });
    }

    const rawResponseText = await lambdaResponse.text();
    let parsed: any = null;
    try {
        parsed = JSON.parse(rawResponseText);
        if (parsed && typeof parsed.body === 'string') parsed = JSON.parse(parsed.body);
        if (parsed && typeof parsed.workbook === 'string') parsed.workbook = JSON.parse(parsed.workbook);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return NextResponse.json({ error: "Failed to parse JSON from AI." }, { status: 500 });
    }

    if (!parsed || !parsed.workbook) {
         return NextResponse.json({ error: "No workbook data found in the AI response." }, { status: 500 });
    }

    // --- 🚀 UPDATE USAGE IF SUCCESSFUL & NOT CACHED ---
    const isCached = rawResponseText.toLowerCase().includes("cache") || parsed?.message?.toLowerCase().includes("cache") || parsed?.status === "cached";
    
    if (!isCached) {
        await prisma.user.update({
            where: { email: userEmail },
            data: { modulesGenerated: dbUser.modulesGenerated + 1 }
        });
    } else {
        console.log("Module fetched from cache. No credit deducted.");
    }

    return NextResponse.json({
      success: true,
      workbook: parsed.workbook
    });

  } catch (error: any) {
    console.error("=== SERVER CATCH BLOCK ===", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}