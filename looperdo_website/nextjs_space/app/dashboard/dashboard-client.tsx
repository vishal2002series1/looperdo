'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Flame, Clock, Trophy, TrendingUp, ArrowRight, ArrowLeft, Loader2, X, CheckCircle2, Lock, Unlock, ChevronDown, ChevronUp, Target, BarChart3, Zap, PlayCircle, PlusCircle } from 'lucide-react';
import ReadinessGauge from '@/components/readiness-gauge';
import SectionReveal from '@/components/section-reveal';

const LOADING_MESSAGES = [
  "⏳ Analyzing your historical weaknesses...",
  "🔍 Checking the database for existing matches...",
  "✍️ Drafting highly calibrated questions...",
  "🧐 Running quality assurance and formatting checks...",
  "🔄 Refining the question batch..."
];

// --- RBAC Config ---
const AVAILABLE_EXAMS = [
  "AWS Solutions Architect Associate",
  "Microsoft Azure Administrator (AZ-104)",
  "Google Cloud Associate Cloud Engineer",
  "Microsoft Power BI Data Analyst (PL-300)",
  "Lean Six Sigma Black Belt (IASSC)",
  "PMI Project Management Professional (PMP)"
];
const SUBSCRIBED_EXAMS = ["AWS Solutions Architect Associate", "Microsoft Azure Administrator (AZ-104)"];

// Helper for Mastery Grid colors
// Note: We now expect numbers between 0 and 1 (e.g., 0.5 = 50%) based on your new API format
const getScoreVisuals = (scoreFraction: number, attempts: number) => {
    if (attempts === 0) return { color: 'bg-gray-100 text-gray-500 border-gray-200', text: 'N/A', isUnexplored: true };
    
    const percentage = Math.round(scoreFraction * 100);
    if (percentage >= 80) return { color: 'bg-green-100 text-green-700 border-green-200', text: `${percentage}%`, isUnexplored: false };
    if (percentage >= 50) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: `${percentage}%`, isUnexplored: false };
    return { color: 'bg-red-100 text-red-700 border-red-200', text: `${percentage}%`, isUnexplored: false };
};


export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [selectedExam, setSelectedExam] = useState("Microsoft Azure Administrator (AZ-104)");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null); 
  
  // --- Dynamic Progress State ---
  const [progressTree, setProgressTree] = useState<any[]>([]); // Now expects an array!
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // 1. Fetch Basic Profile
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/student-profile')
        .then((r) => r?.json?.())
        .then((data: any) => setProfile(data ?? null))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [status]);

  // 2. Fetch Dynamic Progress Tree when Exam Changes
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProgress = async () => {
        setIsFetchingProgress(true);
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: "Vishal", // Override name from history
              target_exam: selectedExam
            })
          });
          
          const json = await res.json();
          if (json.success) {
            // Map the new payload structure
            setProgressTree(json.data.progress_tree || []);
            setOverallScore(Math.round((json.data.true_overall_readiness || 0) * 100));

            // Auto-expand the first domain if available
            if (json.data.progress_tree && json.data.progress_tree.length > 0) {
              setExpandedDomain(json.data.progress_tree[0].subject);
            }
          }
        } catch (e) {
          console.error("Failed to fetch progress tree", e);
        } finally {
          setIsFetchingProgress(false);
        }
      };

      fetchProgress();
    }
  }, [selectedExam, status]);

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

  const handleGenerateTest = async (mode: 'full' | 'targeted', targetDomain?: string, targetTopic?: string) => {
    setIsGeneratingTest(true);
    
    sessionStorage.setItem('activeTest', JSON.stringify({ 
        certificationSlug: selectedExam, 
        mode: mode,
        target_domain: targetDomain,
        target_topic: targetTopic
    }));

    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationSlug: selectedExam, 
          questionCount: 5,
          difficulty: null 
        }),
      });

      const data = await response.json();

      if (response.ok && data.questions?.length > 0) {
        sessionStorage.setItem('activeTest', JSON.stringify({
           testId: data.testId,
           certificationSlug: data.certificationSlug || selectedExam,
           questions: data.questions,
           timeLimit: data.timeLimit
        }));

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
    <div className="bg-gray-50/50 min-h-screen relative pb-20">
      
      <AnimatePresence>
        {isGeneratingTest && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
             <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Welcome back, Vishal</h1>
             <p className="text-gray-500 text-sm mt-1">Track your exam readiness and continue your preparation journey.</p>
          </div>
        </motion.div>

        <SectionReveal>
            <section className="mb-8">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Career Tracks</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {AVAILABLE_EXAMS.map((exam) => {
                        const isSubscribed = SUBSCRIBED_EXAMS.includes(exam);
                        const isSelected = selectedExam === exam;
                        return (
                            <button 
                                key={exam}
                                onClick={() => isSubscribed && setSelectedExam(exam)}
                                className={`snap-start shrink-0 w-72 p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                                    isSelected ? 'border-blue-500 bg-blue-50/50 shadow-md' : 
                                    isSubscribed ? 'border-gray-200 bg-white hover:border-blue-300' : 
                                    'border-gray-200 bg-gray-100 opacity-75 cursor-not-allowed'
                                }`}
                            >
                                {!isSubscribed && (
                                    <div className="absolute top-3 right-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> PRO
                                    </div>
                                )}
                                {isSubscribed && <Unlock className={`absolute top-3 right-3 w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-300'}`} />}
                                
                                <BookOpen className={`w-8 h-8 mb-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                <h3 className={`font-bold leading-tight line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{exam}</h3>
                                {isSubscribed && (
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Dashboard <ArrowLeft className="w-3 h-3 rotate-180" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </section>
        </SectionReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Tests Taken', value: profile?.totalTestsTaken ?? 0, color: '#2563eb' },
            { icon: Clock, label: 'Study Hours', value: profile?.totalStudyHours ?? 0, color: '#7c3aed' },
            { icon: Flame, label: 'Current Streak', value: `${profile?.currentStreak ?? 0} days`, color: '#ea580c' },
            { icon: Trophy, label: 'Best Streak', value: `${profile?.longestStreak ?? 0} days`, color: '#10b981' },
          ].map((s: any, i: number) => {
            const Icon = s?.icon ?? FileText;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border">
                <Icon className="w-5 h-5 mb-2" style={{ color: s?.color ?? '#2563eb' }} />
                <p className="text-2xl font-bold text-[#1e3a5f]">{s?.value ?? 0}</p>
                <p className="text-xs text-gray-400">{s?.label ?? ''}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            <SectionReveal>
              <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col items-center text-center">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Overall Readiness</h2>
                <ReadinessGauge score={overallScore} size={180} />
                <p className="text-sm text-gray-500 mt-6 mb-8 px-2">Your readiness score dynamically updates based on your performance across all {selectedExam} domains.</p>
                
                <button 
                  onClick={() => handleGenerateTest('full')} 
                  disabled={isGeneratingTest || isFetchingProgress}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <PlayCircle className="w-5 h-5" /> Take Full Adaptive Exam
                </button>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Recent Test History</h2>
                <div className="space-y-3">
                  {(profile?.testHistory ?? []).slice(0, 5).map((t: any, i: number) => (
                    <motion.div key={t?.id ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${(t?.score ?? 0) >= 80 ? 'bg-[#10b981]' : (t?.score ?? 0) >= 60 ? 'bg-[#2563eb]' : 'bg-[#f59e0b]'}`} />
                        <div>
                          <p className="text-sm font-medium text-[#1e3a5f] line-clamp-1">{t?.certificationName ?? t?.certificationSlug ?? 'Test Session'}</p>
                          <p className="text-xs text-gray-400">
                            {t?.correctAnswers ?? 0}/{t?.totalQuestions ?? 0} correct · {t?.difficulty ?? 'medium'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-bold ${(t?.score ?? 0) >= 80 ? 'text-[#10b981]' : (t?.score ?? 0) >= 60 ? 'text-[#2563eb]' : 'text-[#f59e0b]'}`}>
                          {t?.score ?? 0}%
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {t?.completedAt ? new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>

          <div className="lg:col-span-2">
            <SectionReveal delay={0.2}>
                <section className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2"><Target className="w-6 h-6 text-blue-500" /> Syllabus Mastery Grid</h2>
                            <p className="text-sm text-gray-500 mt-1">Explore the full syllabus and take targeted micro-tests to improve your score.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto max-h-[600px]">
                        {isFetchingProgress ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                                <p className="font-semibold text-gray-600">Syncing learning progress...</p>
                            </div>
                        ) : progressTree && progressTree.length > 0 ? (
                            
                            // Iterate over the new array format (Domain Level)
                            progressTree.map((domainData: any, dIdx: number) => {
                                const domainName = domainData.subject;
                                
                                // Calculate domain attempted count to know if it's unexplored
                                let domainAttemptedCount = 0;
                                domainData.topics.forEach((topicData: any) => {
                                    topicData.sub_topics.forEach((subtopic: any) => {
                                        domainAttemptedCount += (subtopic.progress.questions_attempted || 0);
                                    });
                                });

                                const domainVisuals = getScoreVisuals(domainData.subject_score, domainAttemptedCount);
                                const isExpanded = expandedDomain === domainName;

                                return (
                                    <div key={dIdx} className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                                        <button 
                                            onClick={() => setExpandedDomain(isExpanded ? null : domainName)}
                                            className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className={`px-3 py-1.5 rounded-lg border font-black text-sm ${domainVisuals.color}`}>
                                                    {domainVisuals.text}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${domainVisuals.isUnexplored ? 'text-gray-500' : 'text-[#1e3a5f]'}`}>{domainName}</h3>
                                                    {domainVisuals.isUnexplored && <p className="text-xs text-gray-400 font-medium">Unexplored Domain</p>}
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                    <div className="bg-gray-50 border-t p-4 space-y-3">
                                                        
                                                        {/* Iterate over Topics inside the Domain */}
                                                        {domainData.topics.map((topicData: any, tIdx: number) => {
                                                            const topicName = topicData.topic;
                                                            
                                                            // Calculate total attempts for this specific topic
                                                            let topicAttemptedCount = 0;
                                                            topicData.sub_topics.forEach((subtopic: any) => {
                                                                topicAttemptedCount += (subtopic.progress.questions_attempted || 0);
                                                            });

                                                            const topicVisuals = getScoreVisuals(topicData.topic_score, topicAttemptedCount);
                                                            
                                                            return (
                                                                <div key={tIdx} className={`flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm transition-colors ${topicVisuals.isUnexplored ? 'border-dashed border-gray-300 bg-gray-50/50' : 'hover:border-blue-100'}`}>
                                                                    <div className="flex items-center gap-4 pr-4">
                                                                        <div className={`w-12 shrink-0 text-center py-1 rounded border font-bold text-xs ${topicVisuals.color}`}>
                                                                            {topicVisuals.text}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className={`font-bold text-sm ${topicVisuals.isUnexplored ? 'text-gray-500' : 'text-[#1e3a5f]'}`}>{topicName}</h4>
                                                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                                                {topicData.sub_topics.slice(0, 3).map((s:any) => s.sub_topic).join(", ")}
                                                                                {topicData.sub_topics.length > 3 ? "..." : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <button 
                                                                        onClick={() => handleGenerateTest('targeted', domainName, topicName)}
                                                                        disabled={isGeneratingTest}
                                                                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                                                            topicVisuals.isUnexplored
                                                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                                                                                : topicData.topic_score < 0.50 
                                                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:shadow-md' 
                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                                                        }`}
                                                                    >
                                                                        {topicVisuals.isUnexplored ? (
                                                                            <><PlusCircle className="w-3 h-3" /> Start Learning</>
                                                                        ) : topicData.topic_score < 0.50 ? (
                                                                            <><Zap className="w-3 h-3" /> Urgent Practice</>
                                                                        ) : (
                                                                            <><Target className="w-3 h-3" /> Improve</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-12 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50/50 border-2 border-dashed rounded-xl">
                                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-semibold text-gray-600">No Data Available</p>
                                <p className="text-sm mt-1">Failed to load syllabus data.</p>
                            </div>
                        )}
                    </div>
                </section>
            </SectionReveal>
          </div>
        </div>
      </div>
    </div>
  );
}