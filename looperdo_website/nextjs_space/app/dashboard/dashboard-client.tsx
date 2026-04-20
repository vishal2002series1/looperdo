'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Flame, Clock, Trophy, ArrowRight, ArrowLeft, Loader2, Lock, Unlock, ChevronDown, ChevronUp, Target, Zap, PlayCircle, PlusCircle, Crown, X } from 'lucide-react';
import ReadinessGauge from '@/components/readiness-gauge';
import SectionReveal from '@/components/section-reveal';
import { SUBSCRIPTION_CONFIG } from '@/lib/tier-config';

const AVAILABLE_EXAMS = [
  "AWS Solutions Architect Associate",
  "Microsoft Azure Administrator (AZ-104)",
  "Google Cloud Associate Cloud Engineer",
  "Microsoft Power BI Data Analyst (PL-300)",
  "Lean Six Sigma Black Belt (IASSC)",
  "PMI Project Management Professional (PMP)"
];

const getScoreVisuals = (scoreFraction: number, attempts: number) => {
    if (attempts === 0) return { color: 'bg-gray-100 text-gray-500 border-gray-200', text: 'N/A', isUnexplored: true };
    const percentage = Math.round(scoreFraction * 100);
    if (percentage >= 80) return { color: 'bg-green-100 text-green-700 border-green-200', text: `${percentage}%`, isUnexplored: false };
    if (percentage >= 50) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: `${percentage}%`, isUnexplored: false };
    return { color: 'bg-red-100 text-red-700 border-red-200', text: `${percentage}%`, isUnexplored: false };
};

const getTestModeDetails = (results: any[]) => {
    if (!results || results.length === 0) return { label: "Practice Test", badgeColor: "bg-gray-100 text-gray-600" };
    const uniqueSubjects = new Set(results.map(r => r.subject));
    const uniqueTopics = new Set(results.map(r => r.topic));
    if (uniqueSubjects.size > 1) {
        return { label: "Full Adaptive Exam", badgeColor: "bg-purple-100 text-purple-700 border-purple-200" };
    } else if (uniqueTopics.size > 1) {
        return { label: `Subject Test: ${results[0].subject}`, badgeColor: "bg-blue-100 text-blue-700 border-blue-200" };
    } else {
        return { label: `Topic Test: ${results[0].topic}`, badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    }
};

const formatDateSafely = (timestamp: string | number, includeTime: boolean = false) => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Recently';
        const options: Intl.DateTimeFormatOptions = includeTime
            ? { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch {
        return 'Recently';
    }
};

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL-TIME PROGRESS STATES (Removed AI references)
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState("Initializing your personalized session...");

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState("");

  const [selectedExam, setSelectedExam] = useState("AWS Solutions Architect Associate");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const [progressTree, setProgressTree] = useState<any[]>([]);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    setMounted(true);
    const savedExam = sessionStorage.getItem('lastViewedExam');
    if (savedExam && AVAILABLE_EXAMS.includes(savedExam)) {
      setSelectedExam(savedExam);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
        router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/student-profile')
        .then((r) => r?.json?.())
        .then((data: any) => {
           if (data?.unlockedExams?.length === 0 && data?.subscriptionTier === "FREE") {
               router.replace('/onboarding');
           } else {
               setProfile(data ?? null);
           }
        })
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      const fetchHistory = async () => {
        try {
          const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: session?.user?.name?.split(' ')[0] || "Student" })
          });
          const json = await res.json();
          if (json.success) setTestHistory(json.history);
        } catch (e) {
          console.error("Failed to fetch history", e);
        }
      };
      fetchHistory();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      const fetchProgress = async () => {
        setIsFetchingProgress(true);
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: session?.user?.name?.split(' ')[0] || "Student",
              target_exam: selectedExam
            })
          });
          const json = await res.json();
          if (json.success) {
            setProgressTree(json.data.progress_tree || []);
            setOverallScore(Math.round((json.data.true_overall_readiness || 0) * 100));
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
  }, [selectedExam, status, session]);

  const filteredHistory = useMemo(() => {
    return testHistory.filter((t: any) => t.exam === selectedExam);
  }, [testHistory, selectedExam]);

  const handleExamChange = (exam: string) => {
    setSelectedExam(exam);
    sessionStorage.setItem('lastViewedExam', exam);
  };

  const handleGenerateTest = async (mode: 'full' | 'targeted', targetDomain?: string, targetTopic?: string) => {
    setIsGeneratingTest(true);
    setGenerationProgress(0);
    setGenerationMessage("Assessing your performance history...");

    const tier = (profile?.subscriptionTier as keyof typeof SUBSCRIPTION_CONFIG) || 'FREE';
    const config = SUBSCRIPTION_CONFIG[tier] || SUBSCRIPTION_CONFIG.FREE;
    const questionCount = mode === 'full' ? config.questionsPerAdaptiveTest : config.questionsPerTopicTest;

    sessionStorage.setItem('activeTest', JSON.stringify({
        certificationSlug: selectedExam,
        mode: mode,
        target_domain: targetDomain,
        target_topic: targetTopic
    }));
    sessionStorage.setItem('lastViewedExam', selectedExam);

    try {
      while (true) {
        const response = await fetch('/api/generate-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            certificationSlug: selectedExam,
            questionCount: questionCount,
            difficulty: null,
            targetDomain: targetDomain,
            targetTopic: targetTopic
          }),
        });

        const data = await response.json();

        // 1. Paywall Check
        if (response.status === 403) {
            setPaywallMessage(data.message || "You have reached your free limit.");
            setShowPaywall(true);
            setIsGeneratingTest(false);
            break;
        }

        // 2. Generation Ongoing (Update UI with custom USP messages and wait 3 seconds)
        if (data.status === "generating") {
            const prog = data.progress || 5;
            setGenerationProgress(prog);
            
            // 🚀 Marketing Messages mapped to progress percentage
            if (prog < 20) {
                setGenerationMessage("Assessing your performance history...");
            } else if (prog < 40) {
                setGenerationMessage("Identifying key improvement areas...");
            } else if (prog < 60) {
                setGenerationMessage("Gathering targeted questions...");
            } else if (prog < 80) {
                setGenerationMessage("Configuring adaptive difficulty levels...");
            } else {
                setGenerationMessage("Personalizing test for your profile...");
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000)); // Sleep for 3 seconds
        } 
        
        // 3. Test Ready! (Break loop and navigate)
        else if (data.status === "ready" || data.questions?.length > 0) {
            setGenerationProgress(100);
            setGenerationMessage("Your bespoke test is ready!");
            
            sessionStorage.setItem('activeTest', JSON.stringify({
               testId: data.testId,
               certificationSlug: data.certificationSlug || selectedExam,
               questions: data.questions,
               timeLimit: data.timeLimit
            }));
            
            setTimeout(() => {
                router.push(`/assessment/${data.testId}`);
            }, 500);
            break;
        } 
        
        // 4. Error Condition
        else {
            const errMsg = data.error ?? "An error occurred while configuring your test.";
            console.error("Failed:", errMsg);
            alert(`Generation Failed: ${errMsg}`);
            setIsGeneratingTest(false);
            break;
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error connecting to testing engine.");
      setIsGeneratingTest(false);
    }
  };

  const handleHistoryClick = (t: any) => {
    sessionStorage.setItem('lastResult', JSON.stringify({
      score: t.score_percentage,
      score_percentage: t.score_percentage,
      graded_results: t.graded_results,
      study_plan: t.study_plan,
    }));
    sessionStorage.setItem('activeTest', JSON.stringify({
      certificationSlug: t.exam || selectedExam,
    }));
    sessionStorage.setItem('resultSource', 'history');
    router.push('/results');
  };

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="bg-gray-50/50 min-h-screen relative pb-20">
      <AnimatePresence>
        {showPaywall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2563eb] to-[#7c3aed]" />
              <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-inner">
                <Crown className="w-10 h-10 text-[#7c3aed]" />
              </div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-3">Upgrade to Premium</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">{paywallMessage}</p>
              <button onClick={() => router.push('/pricing')} className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                View Pricing Plans <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGeneratingTest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#2563eb] mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">Building Adaptive Test</h2>
                
                {/* 🚀 REAL-TIME PROGRESS BAR UI */}
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <p className="text-sm font-semibold text-gray-500 mb-1">{generationProgress}% Complete</p>
                <p className="text-lg text-blue-600 font-medium animate-pulse">
                  {generationMessage}
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Welcome back, {session?.user?.name?.split(' ')[0] || "Student"}</h1>
            <span className="block text-gray-500 text-sm mt-1">Track your exam readiness and continue your preparation journey.</span>
          </div>
        </motion.div>

        <SectionReveal>
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Career Tracks</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {AVAILABLE_EXAMS.map((exam) => {
                const isSubscribed = profile?.unlockedExams?.includes(exam) || profile?.subscriptionTier === "ALL_ACCESS";
                const isSelected = selectedExam === exam;
                return (
                  <button
                    key={exam}
                    onClick={() => isSubscribed && handleExamChange(exam)}
                    className={`snap-start shrink-0 w-72 p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                      isSelected ? 'border-blue-500 bg-blue-50/50 shadow-md' :
                      isSubscribed ? 'border-gray-200 bg-white hover:border-blue-300' :
                      'border-gray-200 bg-gray-100 opacity-75 cursor-not-allowed'
                    }`}
                  >
                    {!isSubscribed && (
                      <span className="absolute top-3 right-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PRO
                      </span>
                    )}
                    {isSubscribed && <Unlock className={`absolute top-3 right-3 w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-300'}`} />}
                    <BookOpen className={`w-8 h-8 mb-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h3 className={`font-bold leading-tight line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{exam}</h3>
                    {isSubscribed && (
                      <span className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Dashboard <ArrowLeft className="w-3 h-3 rotate-180" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </SectionReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Tests Taken', value: filteredHistory.length, color: '#2563eb' },
            { icon: Clock, label: 'Study Hours', value: profile?.totalStudyHours ?? 0, color: '#7c3aed' },
            { icon: Flame, label: 'Current Streak', value: `${profile?.currentStreak ?? 0} days`, color: '#ea580c' },
            { icon: Trophy, label: 'Best Streak', value: `${profile?.longestStreak ?? 0} days`, color: '#10b981' },
          ].map((s: any, i: number) => {
            const Icon = s?.icon ?? FileText;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border">
                <Icon className="w-5 h-5 mb-2" style={{ color: s?.color ?? '#2563eb' }} />
                <span className="block text-2xl font-bold text-[#1e3a5f]">{s?.value ?? 0}</span>
                <span className="block text-xs text-gray-400">{s?.label ?? ''}</span>
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
                <span className="block text-sm text-gray-500 mt-6 mb-8 px-2">Your readiness score dynamically updates based on your performance across all {selectedExam} domains.</span>
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
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Clock className="w-4 h-4" /> Recent History</h2>
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Click to review</span>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredHistory.length === 0 ? (
                    <span className="block text-sm text-gray-400 text-center py-4">No tests taken yet for this track.</span>
                  ) : (
                    filteredHistory.map((t: any, i: number) => {
                      const score = t?.score_percentage ?? 0;
                      const correctAns = t?.graded_results?.filter((r: any) => r.is_correct).length ?? 0;
                      const totalQs = t?.graded_results?.length ?? 0;
                      const modeDetails = getTestModeDetails(t.graded_results);

                      return (
                        <motion.div
                          key={t?.timestamp ?? i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleHistoryClick(t)}
                          className="border rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white group"
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${score >= 80 ? 'bg-[#10b981]' : score >= 60 ? 'bg-[#2563eb]' : 'bg-[#f59e0b]'}`} />
                              <div>
                                <span className="block text-sm font-bold text-[#1e3a5f] line-clamp-1 group-hover:text-blue-600 transition-colors">
                                  {modeDetails.label}
                                </span>
                                <span className="block text-xs text-gray-500 mt-0.5" suppressHydrationWarning>
                                  {formatDateSafely(t.timestamp)} • {correctAns}/{totalQs} correct
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`block text-lg font-black ${score >= 80 ? 'text-[#10b981]' : score >= 60 ? 'text-[#2563eb]' : 'text-[#f59e0b]'}`}>
                                {score}%
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
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
                    <span className="block text-sm text-gray-500 mt-1">Explore the full syllabus and take targeted micro-tests to improve your score.</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[600px]">
                  {isFetchingProgress ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                      <span className="block font-semibold text-gray-600">Syncing learning progress...</span>
                    </div>
                  ) : progressTree && progressTree.length > 0 ? (
                    progressTree.map((domainData: any, dIdx: number) => {
                      const domainName = domainData.subject;

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
                            <span className="flex items-center gap-4 text-left">
                              <span className={`px-3 py-1.5 rounded-lg border font-black text-sm ${domainVisuals.color}`}>
                                {domainVisuals.text}
                              </span>
                              <span className="flex flex-col">
                                <span className={`font-bold ${domainVisuals.isUnexplored ? 'text-gray-500' : 'text-[#1e3a5f]'}`}>{domainName}</span>
                                {domainVisuals.isUnexplored && <span className="text-xs text-gray-400 font-medium">Unexplored Domain</span>}
                              </span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="bg-gray-50 border-t p-4 space-y-3">
                                  {domainData.topics.map((topicData: any, tIdx: number) => {
                                    const topicName = topicData.topic;

                                    let topicAttemptedCount = 0;
                                    topicData.sub_topics.forEach((subtopic: any) => {
                                      topicAttemptedCount += (subtopic.progress.questions_attempted || 0);
                                    });

                                    const topicVisuals = getScoreVisuals(topicData.topic_score, topicAttemptedCount);

                                    return (
                                      <div key={tIdx} className={`flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm transition-colors ${topicVisuals.isUnexplored ? 'border-dashed border-gray-300 bg-gray-50/50' : 'hover:border-blue-100'}`}>
                                        <div className="flex items-center gap-4 pr-4">
                                          <span className={`block w-12 shrink-0 text-center py-1 rounded border font-bold text-xs ${topicVisuals.color}`}>
                                            {topicVisuals.text}
                                          </span>
                                          <div>
                                            <span className={`block font-bold text-sm ${topicVisuals.isUnexplored ? 'text-gray-500' : 'text-[#1e3a5f]'}`}>{topicName}</span>
                                            <span className="block text-xs text-gray-400 mt-1 line-clamp-1">
                                              {topicData.sub_topics.slice(0, 3).map((s: any) => s.sub_topic).join(", ")}
                                              {topicData.sub_topics.length > 3 ? "..." : ""}
                                            </span>
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
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50/50 border-2 border-dashed rounded-xl">
                      <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                      <span className="block font-semibold text-gray-600">No Data Available</span>
                      <span className="block text-sm mt-1">Failed to load syllabus data.</span>
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