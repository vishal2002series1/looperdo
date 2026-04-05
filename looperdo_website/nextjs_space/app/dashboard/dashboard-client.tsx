'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Flame, Clock, Trophy, TrendingUp, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';
import ReadinessGauge from '@/components/readiness-gauge';
import SectionReveal from '@/components/section-reveal';
import TopicChart from './topic-chart';
import { mockWorkbook } from '@/lib/mock-data';

// --- NEW: Loading Animation Messages (No "Agent" word) ---
const LOADING_MESSAGES = [
  "⏳ Analyzing your historical weaknesses...",
  "🔍 Checking the database for existing matches...",
  "✍️ Drafting highly calibrated questions...",
  "🧐 Running quality assurance and formatting checks...",
  "🔄 Refining the question batch..."
];

export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- NEW: Test Generation State ---
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [showWorkbookModal, setShowWorkbookModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/student-profile')
        .then((r) => r?.json?.())
        .then((data: any) => setProfile(data ?? null))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [status]);

  // --- NEW: The Rotating Text Effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingTest) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingTest]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const certs = profile?.certifications ?? [];
  const tests = profile?.testHistory ?? [];
  const activeCert = certs?.[0] ?? null;
  const topicScores = activeCert?.topicScores ?? {};

  // --- NEW: The Live API Call Function ---
  // --- NEW: The Live API Call Function ---
  const handleGenerateRealTest = async () => {
    setIsGeneratingTest(true);
    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationSlug: activeCert?.certificationName || 'UPSC', 
          questionCount: 5,
          difficulty: null // Triggers adaptive auto-mode
        }),
      });

      const data = await response.json();

      if (response.ok && data.questions?.length > 0) {
        // Store the live questions in sessionStorage so the test page can grab them
        sessionStorage.setItem('activeTest', JSON.stringify({
           testId: data.testId,
           certificationSlug: data.certificationSlug,
           questions: data.questions,
           timeLimit: data.timeLimit
        }));

        // Route the user to the assessment interface
        router.push(`/assessment/${data.testId}`);
        
      } else {
        const errMsg = data.error ?? "Unknown error from AI engine";
        console.error("Failed:", errMsg);
        alert(`Generation Failed: ${errMsg}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error connecting to AI engine.");
    } finally {
      setIsGeneratingTest(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen relative">
      
      {/* --- NEW: Full Screen Loading Overlay for Test Generation --- */}
      <AnimatePresence>
        {isGeneratingTest && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#2563eb] mb-6" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Building Your Adaptive Test</h2>
            <p className="text-lg text-blue-600 font-medium animate-pulse transition-opacity duration-500 text-center px-4 max-w-md">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Welcome back, {session?.user?.name?.split?.(' ')?.[0] ?? 'Student'}</h1>
          <p className="text-gray-500 text-sm mt-1">Track your exam readiness and continue your preparation journey.</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Tests Taken', value: profile?.totalTestsTaken ?? 0, color: '#2563eb' },
            { icon: Clock, label: 'Study Hours', value: profile?.totalStudyHours ?? 0, color: '#7c3aed' },
            { icon: Flame, label: 'Current Streak', value: `${profile?.currentStreak ?? 0} days`, color: '#ea580c' },
            { icon: Trophy, label: 'Best Streak', value: `${profile?.longestStreak ?? 0} days`, color: '#10b981' },
          ].map((s: any, i: number) => {
            const Icon = s?.icon ?? FileText;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <Icon className="w-5 h-5 mb-2" style={{ color: s?.color ?? '#2563eb' }} />
                <p className="text-2xl font-bold text-[#1e3a5f]">{s?.value ?? 0}</p>
                <p className="text-xs text-gray-400">{s?.label ?? ''}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Readiness + Active Certs */}
          <div className="lg:col-span-1 space-y-6">
            <SectionReveal>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Overall Readiness</h2>
                <ReadinessGauge score={profile?.readinessScore ?? 0} size={180} />
              </div>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Active Certifications</h2>
                <div className="space-y-3">
                  {(certs ?? []).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-[#1e3a5f]">{c?.certificationName ?? ''}</p>
                        <p className="text-xs text-gray-400">{c?.testsCompleted ?? 0} tests completed</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${(c?.readinessScore ?? 0) >= 80 ? 'text-[#10b981]' : (c?.readinessScore ?? 0) >= 60 ? 'text-[#2563eb]' : 'text-[#f59e0b]'}`}>
                          {c?.readinessScore ?? 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>

            {/* Quick Actions */}
            <SectionReveal delay={0.2}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {/* --- NEW: Changed the first action to trigger the real API --- */}
                  <button
                    onClick={handleGenerateRealTest}
                    disabled={isGeneratingTest}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-md bg-[#2563eb] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#1e3a5f] flex-1">Generate Adaptive Test</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2563eb] transition-colors" />
                  </button>

                  {[
                    { label: 'View Workbook', icon: BookOpen, color: 'bg-[#7c3aed]', action: () => setShowWorkbookModal(true) },
                    { label: 'Track Progress', icon: TrendingUp, color: 'bg-[#10b981]', action: () => { const el = document.getElementById('topic-section'); el?.scrollIntoView?.({ behavior: 'smooth' }); } },
                  ].map((action: any, i: number) => {
                    const Icon = action?.icon ?? FileText;
                    return (
                      <button
                        key={i}
                        onClick={action?.action}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className={`w-8 h-8 rounded-md ${action?.color ?? 'bg-[#2563eb]'} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#1e3a5f] flex-1">{action?.label ?? ''}</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2563eb] transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Right: Charts + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Breakdown */}
            <SectionReveal>
              <div id="topic-section" className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Sub-Topic Proficiency — {activeCert?.certificationName ?? 'Select a certification'}
                </h2>
                <TopicChart topicScores={topicScores} />
              </div>
            </SectionReveal>

            {/* Test History */}
            <SectionReveal delay={0.1}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Test History</h2>
                <div className="space-y-3">
                  {(tests ?? []).slice(0, 6).map((t: any, i: number) => (
                    <motion.div
                      key={t?.id ?? i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${(t?.score ?? 0) >= 80 ? 'bg-[#10b981]' : (t?.score ?? 0) >= 60 ? 'bg-[#2563eb]' : 'bg-[#f59e0b]'}`} />
                        <div>
                          <p className="text-sm font-medium text-[#1e3a5f]">{t?.certificationName ?? t?.certificationSlug ?? ''}</p>
                          <p className="text-xs text-gray-400">
                            {t?.correctAnswers ?? 0}/{t?.totalQuestions ?? 0} correct · {t?.difficulty ?? 'medium'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${(t?.score ?? 0) >= 80 ? 'text-[#10b981]' : (t?.score ?? 0) >= 60 ? 'text-[#2563eb]' : 'text-[#f59e0b]'}`}>
                          {t?.score ?? 0}%
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {t?.completedAt ? new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </div>

      {/* Workbook Modal */}
      <AnimatePresence>
        {showWorkbookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowWorkbookModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e: any) => e?.stopPropagation?.()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1e3a5f]">{mockWorkbook?.title ?? 'Study Workbook'}</h2>
                <button onClick={() => setShowWorkbookModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-6">
                {(mockWorkbook?.sections ?? []).map((sec: any, i: number) => (
                  <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-[#1e3a5f]">{sec?.topic ?? ''}</h3>
                      <span className={`text-sm font-bold ${(sec?.score ?? 0) >= 70 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>{sec?.score ?? 0}%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">{sec?.theory ?? ''}</p>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Key Points</p>
                      <ul className="space-y-1">
                        {(sec?.keyPoints ?? []).map((kp: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                            {kp ?? ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Memory Tricks</p>
                      <ul className="space-y-1">
                        {(sec?.tricks ?? []).map((t: string, j: number) => (
                          <li key={j} className="text-xs text-[#7c3aed] bg-purple-50 px-2 py-1 rounded">💡 {t ?? ''}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">This is a demo workbook preview. Full workbook generation connects to the adaptive engine.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}