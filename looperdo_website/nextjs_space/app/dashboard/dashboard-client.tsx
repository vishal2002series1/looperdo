'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Flame, Clock, Trophy, TrendingUp, ArrowRight, ArrowLeft, Loader2, X, CheckCircle2, Lock, Unlock, ChevronDown, ChevronUp, Target, BarChart3, Zap, PlayCircle, PlusCircle, Video, BrainCircuit, Lightbulb, PenTool, Network } from 'lucide-react';
import ReadinessGauge from '@/components/readiness-gauge';
import SectionReveal from '@/components/section-reveal';

// 🚀 Markdown & Math Rendering Imports
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// 🚀 Tab Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LOADING_MESSAGES = [
  "⏳ Analyzing your historical weaknesses...",
  "🔍 Checking the database for existing matches...",
  "✍️ Drafting highly calibrated questions...",
  "🧐 Running quality assurance and formatting checks...",
  "🔄 Refining the question batch..."
];

const WORKBOOK_LOADING_MESSAGES = [
  "🔍 Researcher Agent is finding the best video resources...",
  "✍️ Author Agent is drafting theory and mnemonics...",
  "🎨 Designer Agent is mapping the concepts...",
  "🗂️ Curator Agent is pulling relevant practice questions...",
  "💾 Compiler is caching your workbook to DynamoDB..."
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
const getScoreVisuals = (scoreFraction: number, attempts: number) => {
    if (attempts === 0) return { color: 'bg-gray-100 text-gray-500 border-gray-200', text: 'N/A', isUnexplored: true };
    
    const percentage = Math.round(scoreFraction * 100);
    if (percentage >= 80) return { color: 'bg-green-100 text-green-700 border-green-200', text: `${percentage}%`, isUnexplored: false };
    if (percentage >= 50) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: `${percentage}%`, isUnexplored: false };
    return { color: 'bg-red-100 text-red-700 border-red-200', text: `${percentage}%`, isUnexplored: false };
};

// Helper to determine the type of test based on the question spread
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

// Hydration-safe date formatter
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

// 🚀 FIX: Defensive extraction of workbook data regardless of nesting
const extractWorkbookData = (rawData: any): any => {
    if (!rawData) return null;
    
    // Sometimes it's deeply nested: rawData.workbook.workbook.theory_markdown
    if (rawData.workbook && rawData.workbook.theory_markdown) {
        return rawData.workbook;
    }
    
    // Sometimes it's one level up: rawData.theory_markdown
    if (rawData.theory_markdown) {
        return rawData;
    }

    // Keep digging if it's double-wrapped
    if (rawData.workbook && rawData.workbook.workbook) {
        return extractWorkbookData(rawData.workbook.workbook);
    }

    return rawData;
};

export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [isGeneratingWorkbook, setIsGeneratingWorkbook] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [selectedExam, setSelectedExam] = useState("AWS Solutions Architect Associate");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null); 
  
  // --- Dynamic Progress & History State ---
  const [progressTree, setProgressTree] = useState<any[]>([]); 
  const [testHistory, setTestHistory] = useState<any[]>([]); 
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  
  // --- Modal States ---
  const [activeReviewTest, setActiveReviewTest] = useState<any | null>(null);
  const [activeWorkbook, setActiveWorkbook] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedExam = sessionStorage.getItem('lastViewedExam');
    if (savedExam && AVAILABLE_EXAMS.includes(savedExam)) {
      setSelectedExam(savedExam);
    }
  }, []);

  const handleExamChange = (exam: string) => {
    setSelectedExam(exam);
    sessionStorage.setItem('lastViewedExam', exam);
    setActiveReviewTest(null); 
    setActiveWorkbook(null);
  };

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

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchHistory = async () => {
        try {
          const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: session?.user?.name ? session.user.name.split(' ')[0] : "Vishal"
            })
          });
          const json = await res.json();
          if (json.success) {
            setTestHistory(json.history);
          }
        } catch (e) {
          console.error("Failed to fetch AWS history", e);
        }
      };
      fetchHistory();
    }
  }, [status, session, activeReviewTest]); 

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProgress = async () => {
        setIsFetchingProgress(true);
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: session?.user?.name ? session.user.name.split(' ')[0] : "Vishal",
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingTest || isGeneratingWorkbook) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % 5);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingTest, isGeneratingWorkbook]);

  if (!mounted) return null;

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
    sessionStorage.setItem('lastViewedExam', selectedExam); 

    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationSlug: selectedExam, 
          questionCount: 5,
          difficulty: null,
          targetDomain: targetDomain, 
          targetTopic: targetTopic    
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

  const handleGenerateWorkbook = async (subject: string, topic: string, subTopic: string, difficulty: number = 3) => {
    setIsGeneratingWorkbook(true);
    try {
        const response = await fetch('/api/build-module', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                certificationSlug: selectedExam,
                targetSubject: subject,
                targetTopic: topic,
                targetSubTopic: subTopic,
                difficulty: difficulty
            })
        });
        const data = await response.json();
        
        // 🚀 FIX: Safely extract the workbook data regardless of how deeply nested it is
        const cleanWorkbook = extractWorkbookData(data.workbook || data);
        
        if (response.ok && cleanWorkbook) {
            setActiveWorkbook(cleanWorkbook);
        } else {
            console.error("Workbook extraction failed. Raw data:", data);
            alert(data.error || "Failed to generate study module. The AI returned an invalid structure.");
        }
    } catch(e) {
        console.error(e);
        alert("Network error while generating module.");
    } finally {
        setIsGeneratingWorkbook(false);
    }
  };

  const filteredHistory = testHistory.filter((t: any) => t.exam === selectedExam);

  return (
    <div className="bg-gray-50/50 min-h-screen relative pb-20">
      
      {/* Loading Overlays */}
      <AnimatePresence>
        {(isGeneratingTest || isGeneratingWorkbook) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#2563eb] mb-6" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                {isGeneratingWorkbook ? "Building Your Study Module" : "Building Your Adaptive Test"}
            </h2>
            <p className="text-lg text-blue-600 font-medium animate-pulse transition-opacity duration-500 text-center px-4 max-w-md">
              {isGeneratingWorkbook ? WORKBOOK_LOADING_MESSAGES[loadingMessageIndex] : LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Review Modal */}
      <AnimatePresence>
        {activeReviewTest && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gray-50 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="bg-white border-b px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                 <div>
                   <h2 className="text-2xl font-bold text-[#1e3a5f] mb-1">
                       {activeWorkbook ? `Study Module` : "Detailed Test Review"}
                   </h2>
                   {!activeWorkbook && (
                       <div className="flex items-center gap-3">
                         <span className="text-sm text-gray-500 font-medium" suppressHydrationWarning>
                           {formatDateSafely(activeReviewTest.timestamp, true)}
                         </span>
                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTestModeDetails(activeReviewTest.graded_results).badgeColor}`}>
                            {getTestModeDetails(activeReviewTest.graded_results).label}
                         </span>
                       </div>
                   )}
                 </div>
                 <button onClick={() => { setActiveReviewTest(null); setActiveWorkbook(null); }} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh] space-y-8">
                 
                 {activeWorkbook ? (
                     
                     // ==========================================
                     // TABBED WORKBOOK UI RENDERER
                     // ==========================================
                     <div className="space-y-6">
                        <button onClick={() => setActiveWorkbook(null)} className="flex items-center gap-2 text-blue-600 font-bold mb-2 hover:underline">
                            <ArrowLeft className="w-4 h-4" /> Back to Test Review
                        </button>
                        
                        <Tabs defaultValue="theory" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 bg-gray-100 p-1 rounded-xl shadow-inner">
                                <TabsTrigger value="theory" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg flex gap-2 font-semibold">
                                    <BookOpen className="w-4 h-4"/> Theory
                                </TabsTrigger>
                                <TabsTrigger value="mindmap" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg flex gap-2 font-semibold">
                                    <Network className="w-4 h-4"/> Mind Map
                                </TabsTrigger>
                                <TabsTrigger value="tricks" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm rounded-lg flex gap-2 font-semibold">
                                    <Lightbulb className="w-4 h-4"/> Tricks
                                </TabsTrigger>
                                <TabsTrigger value="videos" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm rounded-lg flex gap-2 font-semibold">
                                    <Video className="w-4 h-4"/> Videos
                                </TabsTrigger>
                                <TabsTrigger value="practice" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-lg flex gap-2 font-semibold">
                                    <PenTool className="w-4 h-4"/> Practice
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB: Theory */}
                            <TabsContent value="theory" className="mt-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                                    <h4 className="font-bold text-2xl text-[#1e3a5f] mb-6 flex items-center gap-2 border-b pb-4"><BookOpen className="w-6 h-6 text-blue-500" /> Theory & Concepts</h4>
                                    <div className="prose max-w-none text-gray-700">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {activeWorkbook.theory_markdown || "Theory content is being generated..."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: Mind Map */}
                            <TabsContent value="mindmap" className="mt-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                                    <h4 className="font-bold text-2xl text-[#1e3a5f] mb-6 flex items-center gap-2 border-b pb-4"><Network className="w-6 h-6 text-indigo-500" /> Concept Mind Map</h4>
                                    <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100 overflow-x-auto shadow-inner">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {activeWorkbook.mindmap_markdown || "No mind map available for this module."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: Tricks & Mnemonics */}
                            <TabsContent value="tricks" className="mt-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                                    <h4 className="font-bold text-2xl text-[#1e3a5f] mb-6 flex items-center gap-2 border-b pb-4"><Zap className="w-6 h-6 text-yellow-500" /> Tricks & Mnemonics</h4>
                                    <div className="prose max-w-none text-gray-700">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {activeWorkbook.tricks_and_mnemonics || "No tricks available for this topic."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: Videos */}
                            <TabsContent value="videos" className="mt-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                                    <h4 className="font-bold text-2xl text-[#1e3a5f] mb-6 flex items-center gap-2 border-b pb-4"><Video className="w-6 h-6 text-red-500" /> Video Recommendations</h4>
                                    {Array.isArray(activeWorkbook.video_references) && activeWorkbook.video_references.length > 0 ? (
                                        <div className="space-y-4">
                                            {activeWorkbook.video_references.map((vid:any, vIdx:number) => (
                                                <div key={vIdx} className="p-5 border rounded-xl bg-gray-50 flex flex-col gap-2 hover:border-red-200 transition-colors shadow-sm">
                                                    <a href={vid.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-lg flex items-center gap-2">
                                                        <PlayCircle className="w-5 h-5 text-red-500 shrink-0" /> <span className="line-clamp-1">{vid.title}</span>
                                                    </a>
                                                    <span className="text-sm text-gray-600 ml-7 leading-relaxed block">{vid.why_watch_this}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 block">No video resources found.</span>
                                    )}
                                </div>
                            </TabsContent>

                            {/* TAB: Practice Questions */}
                            <TabsContent value="practice" className="mt-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                                    <h4 className="font-bold text-2xl text-[#1e3a5f] mb-6 flex items-center gap-2 border-b pb-4"><PenTool className="w-6 h-6 text-green-500" /> Practice Questions</h4>
                                    {Array.isArray(activeWorkbook.practice_questions) && activeWorkbook.practice_questions.length > 0 ? (
                                        <div className="space-y-6">
                                            {activeWorkbook.practice_questions.map((q: any, qIdx: number) => (
                                                <div key={qIdx} className="p-5 border rounded-xl bg-gray-50 shadow-sm">
                                                    <div className="font-bold text-gray-800 mb-4 prose max-w-none flex gap-2">
                                                        <span className="text-gray-400 shrink-0">{qIdx + 1}.</span>
                                                        <div>
                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.text || ""}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                    {Array.isArray(q.options) && q.options.length > 0 && (
                                                        <div className="pl-6 space-y-2 mb-5">
                                                            {q.options.map((opt: string, oIdx: number) => (
                                                                <div key={oIdx} className="text-gray-700 text-sm py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt || ""}</ReactMarkdown>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <details className="group cursor-pointer ml-6">
                                                        <summary className="font-bold text-blue-600 text-xs hover:text-blue-800 transition-colors list-none flex items-center gap-1 bg-blue-100/50 hover:bg-blue-100 px-4 py-2 rounded-lg w-max border border-blue-200">
                                                            <span className="group-open:hidden">Check Answer & Explanation</span>
                                                            <span className="hidden group-open:inline">Hide Answer & Explanation</span>
                                                        </summary>
                                                        <div className="mt-3 text-sm leading-relaxed bg-white p-5 rounded-xl border shadow-sm space-y-3">
                                                            <div className="font-bold text-green-700 flex gap-2">
                                                                <span className="shrink-0">✅ Correct Answer:</span>
                                                                <span className="font-semibold text-gray-800">{q.correct_answer}</span>
                                                            </div>
                                                            <div className="prose prose-sm max-w-none text-gray-600 pt-2 border-t mt-3">
                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                    {q.explanation || ""}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </details>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 block">No practice questions available for this module.</span>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                     </div>

                 ) : (
                     
                     // ==========================================
                     // TEST REVIEW UI RENDERER
                     // ==========================================
                     <>
                         <div className="flex flex-col md:flex-row gap-6 items-stretch">
                            <div className="shrink-0 text-center bg-white p-8 rounded-2xl border shadow-sm flex flex-col justify-center min-w-[200px]">
                               <span className={`block text-6xl font-black ${activeReviewTest.score_percentage >= 80 ? 'text-[#10b981]' : activeReviewTest.score_percentage >= 60 ? 'text-[#2563eb]' : 'text-red-500'}`}>
                                 {activeReviewTest.score_percentage}%
                               </span>
                               <span className="block text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">Final Score</span>
                            </div>
                            
                            {activeReviewTest.study_plan && (
                                <div className="flex-1 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-inner">
                                   <h4 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2 text-lg"><BookOpen className="w-5 h-5 text-blue-500"/> AI Study Plan & Diagnosis</h4>
                                   <div className="prose prose-sm max-w-none text-gray-700">
                                       <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {activeReviewTest.study_plan || ""}
                                       </ReactMarkdown>
                                   </div>
                                </div>
                            )}
                         </div>

                         {/* Actionable Remediation */}
                         {(() => {
                            const mistakes = activeReviewTest.graded_results?.filter((r: any) => !r.is_correct) || [];
                            const uniqueMistakes = Array.from(new Map(mistakes.map((item: any) => [item.sub_topic, item])).values()) as any[];
                            
                            if (uniqueMistakes.length > 0) {
                                return (
                                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                                        <h4 className="font-bold text-red-600 mb-4 flex items-center gap-2 text-lg border-b border-red-100 pb-3"><Target className="w-5 h-5"/> Actionable Remediation</h4>
                                        <span className="block text-sm text-gray-500 mb-4">The AI detected weaknesses in these specific areas. Click to instantly generate a comprehensive study module.</span>
                                        <div className="flex flex-wrap gap-3">
                                            {uniqueMistakes.map((m: any, mIdx: number) => (
                                                <button 
                                                    key={mIdx} 
                                                    onClick={() => handleGenerateWorkbook(m.subject, m.topic, m.sub_topic, m.difficulty)} 
                                                    disabled={isGeneratingWorkbook}
                                                    className="bg-white text-blue-600 px-4 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                                >
                                                    <BookOpen className="w-4 h-4" /> Study: {m.sub_topic}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                         })()}

                         {/* Q&A Breakdown */}
                         <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="font-bold text-lg text-[#1e3a5f] mb-6 border-b pb-3">Detailed Question Breakdown</h3>
                            <div className="space-y-6">
                                {activeReviewTest.graded_results?.map((res: any, qIdx: number) => (
                                    <div key={qIdx} className={`p-5 rounded-xl border ${res.is_correct ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="font-bold text-gray-800 text-base leading-relaxed flex gap-2 w-full">
                                                <span className="text-gray-400 shrink-0">{qIdx + 1}.</span> 
                                                <div className="prose max-w-none text-gray-800 font-bold">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {res.text || ""}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${res.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {res.is_correct ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4 bg-white/50 p-4 rounded-lg border border-white">
                                            <div className={`font-semibold text-sm flex gap-2 ${res.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                                                <span className="shrink-0">{res.is_correct ? '✅' : '❌'} Your Answer:</span> 
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{res.student_answer || ""}</ReactMarkdown>
                                                </div>
                                            </div>
                                            {!res.is_correct && (
                                                <div className="font-semibold text-sm text-green-700 flex gap-2 mt-2">
                                                    <span className="shrink-0">✅ Correct Answer:</span> 
                                                    <div className="prose prose-sm max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{res.correct_answer || ""}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 pt-4 border-t border-gray-100/50 gap-4">
                                            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                                {res.subject} {'>'} {res.topic} {'>'} {res.sub_topic} | Diff: {res.difficulty}
                                            </span>
                                            
                                            <details className="group cursor-pointer w-full md:w-auto">
                                                <summary className="font-bold text-blue-600 text-xs hover:text-blue-800 transition-colors list-none flex items-center justify-end gap-1 px-3 py-1.5 rounded-lg w-max ml-auto bg-blue-50 hover:bg-blue-100">
                                                    <span className="group-open:hidden">Show Explanation</span>
                                                    <span className="hidden group-open:inline">Hide Explanation</span>
                                                </summary>
                                                <div className="mt-3 text-gray-600 text-sm leading-relaxed bg-white p-4 rounded-xl border shadow-sm prose max-w-none w-full">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {res.explanation || "No explanation provided."}
                                                    </ReactMarkdown>
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                     </>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Content */}
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
                        const isSubscribed = SUBSCRIBED_EXAMS.includes(exam);
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
                        )
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
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Clock className="w-4 h-4"/> Recent History</h2>
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Click to review</span>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  
                  {filteredHistory.length === 0 ? (
                      <span className="block text-sm text-gray-400 text-center py-4">No tests taken yet for this track.</span>
                  ) : (
                    filteredHistory.map((t: any, i: number) => {
                      const score = t?.score_percentage ?? 0;
                      const correctAns = t?.graded_results?.filter((r:any) => r.is_correct).length ?? 0;
                      const totalQs = t?.graded_results?.length ?? 0;
                      const modeDetails = getTestModeDetails(t.graded_results);

                      return (
                        <motion.div 
                           key={t?.timestamp ?? i} 
                           initial={{ opacity: 0, x: -10 }} 
                           animate={{ opacity: 1, x: 0 }} 
                           transition={{ delay: i * 0.05 }} 
                          //  onClick={() => setActiveReviewTest(t)}
                           onClick={() => {
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
                            }}
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
                                                                                {topicData.sub_topics.slice(0, 3).map((s:any) => s.sub_topic).join(", ")}
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