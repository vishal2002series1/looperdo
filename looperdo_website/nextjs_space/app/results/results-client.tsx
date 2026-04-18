'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Loader2, X, ChevronDown, ChevronUp, PlayCircle, Video, Crown, Network, Lightbulb, PenTool } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';

const WORKBOOK_MESSAGES = [
  "🔍 Researcher Agent is finding the best video resources...",
  "✍️ Author Agent is drafting theory and mnemonics...",
  "🎨 Designer Agent is mapping the interactive mind map...",
  "🗂️ Curator Agent is pulling relevant practice questions...",
  "💾 Compiler is caching your workbook..."
];

const MindMapRenderer = ({ markdown }: { markdown: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !markdown) return;
    svgRef.current.innerHTML = '';
    
    try {
        const transformer = new Transformer();
        const { root } = transformer.transform(markdown);
        const mm = Markmap.create(svgRef.current, { autoFit: true, duration: 500 }, root);
        
        if (containerRef.current) {
            const oldToolbar = containerRef.current.querySelector('.markmap-toolbar');
            if (oldToolbar) oldToolbar.remove();

            const toolbar = new Toolbar();
            toolbar.attach(mm);
            const el = toolbar.render();
            el.style.position = 'absolute';
            el.style.bottom = '20px';
            el.style.right = '20px';
            containerRef.current.append(el);
        }
    } catch (e) {
        console.error("Markmap rendering error:", e);
    }
  }, [markdown]);

  return (
    <div ref={containerRef} className="relative w-full h-[500px] border rounded-lg bg-white overflow-hidden shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

// Defensive extraction to handle deeply nested AI JSON responses
const extractWorkbookData = (rawData: any): any => {
    if (!rawData) return null;
    if (rawData.workbook && rawData.workbook.theory_markdown) return rawData.workbook;
    if (rawData.theory_markdown) return rawData;
    if (rawData.workbook && rawData.workbook.workbook) return extractWorkbookData(rawData.workbook.workbook);
    return rawData;
};

export default function ResultsClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [resultData, setResultData] = useState<any>(null);
  const [examName, setExamName] = useState<string>('');
  
  const [isGeneratingWorkbook, setIsGeneratingWorkbook] = useState(false);
  const [workbookMessageIndex, setWorkbookMessageIndex] = useState(0);
  const [activeWorkbook, setActiveWorkbook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('theory'); 
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // 🚀 ADDED PAYWALL STATE
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState("");

  const [moduleVideos, setModuleVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    
    const storedResult = sessionStorage.getItem('lastResult');
    const storedTest = sessionStorage.getItem('activeTest'); 
    const lastViewedExam = sessionStorage.getItem('lastViewedExam');
    
    if (storedResult) { 
      setResultData(JSON.parse(storedResult));
    } else {
      router.replace('/dashboard');
      return;
    }

    // Figure out which exam this result is for.
    // Try activeTest first (most accurate), fall back to lastViewedExam.
    if (storedTest) {
        const parsed = JSON.parse(storedTest);
        if (parsed.certificationSlug) {
            setExamName(parsed.certificationSlug);
            return;
        }
    }
    if (lastViewedExam) {
        setExamName(lastViewedExam);
        return;
    }
    
    // If we reach here, something is wrong — send user back to dashboard.
    console.error('No exam context found in sessionStorage');
    router.replace('/dashboard');
}, [status, router]);

  useEffect(() => {
      if (activeWorkbook) {
          const fetchVideos = async () => {
            setIsFetchingVideos(true);
            try {
              // Send structured fields instead of a pre-built query
              // Don't blindly append exam name — it can poison the query
              const res = await fetch('/api/youtube-search', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      subTopic: activeWorkbook.sub_topic,
                      topic: activeWorkbook.topic,  // add this to make queries more specific
                      exam: activeWorkbook.target_exam || examName,
                  })
              });
              const data = await res.json();
                  
                  // 🚀 FIX: Handle empty video arrays correctly
                  if (data.success && data.videos && data.videos.length > 0) {
                      setModuleVideos(data.videos);
                      setActiveVideo(data.videos[0]);
                  } else {
                      setModuleVideos([]);
                      setActiveVideo(null);
                  }
              } catch (e) {
                  console.error("Error fetching dynamic videos:", e);
                  setModuleVideos([]);
                  setActiveVideo(null);
              } finally {
                  setIsFetchingVideos(false);
              }
          };
          fetchVideos();
      } else {
          setModuleVideos([]);
          setActiveVideo(null);
      }
  }, [activeWorkbook, examName]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGeneratingWorkbook) {
      interval = setInterval(() => {
        setWorkbookMessageIndex((prev) => (prev + 1) % WORKBOOK_MESSAGES.length);
      }, 2500);
    } else {
      setWorkbookMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingWorkbook]);

  if (!resultData || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const mistakes = (resultData.graded_results || []).filter((r: any) => !r.is_correct);
  
  const uniqueMistakesMap = new Map();
  mistakes.forEach((m: any) => {
      uniqueMistakesMap.set(m.sub_topic, m);
  });
  const uniqueMistakes = Array.from(uniqueMistakesMap.values());

  const handleGenerateWorkbook = async (mistake: any) => {
    // SAFETY CHECK: don't send requests with no exam context
    if (!examName) {
      alert("Could not determine which exam this is for. Please return to the dashboard and try again.");
      router.replace('/dashboard');
      return;
    }
    setIsGeneratingWorkbook(true);
    setActiveTab('theory'); 
    try {
      const response = await fetch('/api/build-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSubject: mistake.subject || 'General',   
          targetTopic: mistake.topic || 'General',       
          targetSubTopic: mistake.sub_topic,             
          difficulty: mistake.difficulty || 3,           
          certificationSlug: examName                    
        }),
      });

      const data = await response.json();
      
      // 🚀 CRITICAL FIX: Intercept 403 and STOP execution
      if (response.status === 403) {
          setPaywallMessage(data.message || "You have exhausted your free study modules.");
          setShowPaywall(true);
          setIsGeneratingWorkbook(false);
          return; // This prevents the undefined alert from ever happening
      }

      if (!response.ok) {
          alert(data.error || "Failed to generate workbook.");
          setIsGeneratingWorkbook(false);
          return;
      }

      const cleanWorkbook = extractWorkbookData(data.workbook || data);

      if (cleanWorkbook) {
        setActiveWorkbook(cleanWorkbook);
      } else {
        alert(`Failed to extract workbook from AI Response`);
      }
    } catch (error) {
      console.error("Workbook error:", error);
      alert("Network error while generating workbook.");
    } finally {
      setIsGeneratingWorkbook(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      
      {/* 🚀 ADDED PAYWALL MODAL */}
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
        {isGeneratingWorkbook && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#7c3aed] mb-6" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Building Study Module</h2>
            <p className="text-lg text-purple-600 font-medium animate-pulse transition-opacity duration-500 text-center px-4 max-w-md">
              {WORKBOOK_MESSAGES[workbookMessageIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-[#2563eb]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Test Complete!</h1>
          <p className="text-gray-500 mb-6">Here is how you performed on this adaptive assessment.</p>
          <div className="inline-block px-8 py-4 bg-gray-50 rounded-2xl border">
            <span className="text-5xl font-black text-[#2563eb]">{resultData.score}%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-[#7c3aed]">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7c3aed]" /> AI Study Plan & Recommendations
          </h2>
          <div className="prose prose-sm md:prose-base prose-blue max-w-none">
             <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{resultData.study_plan || "No specific study plan was generated."}</ReactMarkdown>
          </div>
        </motion.div>

        {uniqueMistakes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg p-6 shadow-sm">
             <h2 className="text-lg font-bold text-[#1e3a5f] mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Recommended Remediation
            </h2>
            <p className="text-sm text-gray-500 mb-4">Click a topic you failed to instantly generate a targeted study workbook.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uniqueMistakes.map((m: any, i: number) => (
                <button 
                  key={i}
                  onClick={() => handleGenerateWorkbook(m)}
                  className="p-3 text-left border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-gray-400 mb-1 line-clamp-1">{m.topic}</p>
                  <p className="text-sm font-semibold text-[#1e3a5f] group-hover:text-purple-700 line-clamp-1">{m.sub_topic}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg p-6 shadow-sm">
           <h2 className="text-lg font-bold text-[#1e3a5f] mb-6 border-b pb-4">Detailed Breakdown</h2>
           
           <div className="space-y-4">
              {(resultData.graded_results || []).map((result: any, index: number) => {
                 const isExpanded = expandedQuestion === result.question_id;
                 
                 return (
                    <div key={index} className={`border rounded-lg overflow-hidden transition-colors ${result.is_correct ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                       <button onClick={() => toggleExpand(result.question_id)} className="w-full text-left p-4 flex items-start gap-4 hover:bg-black/5 transition-colors">
                          <div className="mt-1">
                             {result.is_correct ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div className="font-medium text-[#1e3a5f] pr-4 prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{result.text}</ReactMarkdown>
                                </div>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                             </div>
                             <p className="text-xs text-gray-500 mt-2">
                                Taxonomy: {result.subject} {'>'} {result.topic} {'>'} {result.sub_topic} | Difficulty: {result.difficulty}
                             </p>
                          </div>
                       </button>

                       <AnimatePresence>
                          {isExpanded && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100 bg-white">
                                <div className="p-4 pl-12 space-y-4">
                                   <div>
                                      {result.is_correct ? (
                                         <p className="text-sm font-semibold text-green-700">✅ Your Answer: {result.student_answer}</p>
                                      ) : (
                                         <>
                                            <p className="text-sm font-semibold text-red-700 mb-1">❌ Your Answer: {result.student_answer}</p>
                                            <p className="text-sm font-semibold text-green-700">✅ Correct Answer: {result.correct_answer}</p>
                                         </>
                                      )}
                                   </div>
                                   
                                   <div className="bg-gray-50 p-6 rounded-lg border prose prose-sm md:prose-base max-w-none">
                                      <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Explanation</p>
                                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                          {result.explanation || "No detailed explanation available."}
                                      </ReactMarkdown>
                                   </div>
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 );
              })}
           </div>
        </motion.div>

        <div className="text-center mt-8 pb-12">
           <button onClick={() => router.push('/dashboard')} className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
        </div>

      </div>

      <AnimatePresence>
        {activeWorkbook && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 pt-12 backdrop-blur-sm"
            onClick={() => setActiveWorkbook(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b bg-gray-50/50 shrink-0">
                <div>
                   <h2 className="text-2xl font-bold text-[#1e3a5f]">{activeWorkbook.sub_topic}</h2>
                   <p className="text-sm text-gray-500 font-medium mt-1">Level {activeWorkbook.difficulty_level || 3} Module • {activeWorkbook.target_exam || examName}</p>
                </div>
                <button onClick={() => setActiveWorkbook(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              
              <div className="flex border-b px-6 shrink-0 bg-white overflow-x-auto">
                  {['theory', 'map', 'tricks', 'videos', 'practice'].map((tab) => (
                      <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-4 text-sm font-bold capitalize transition-colors border-b-2 tracking-wide whitespace-nowrap ${activeTab === tab ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                      >
                          {tab === 'map' ? 'Mind Map' : tab}
                      </button>
                  ))}
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-white">
                  
                  {/* THEORY TAB */}
                  {activeTab === 'theory' && (
                      <div className="prose prose-blue md:prose-lg max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {activeWorkbook.theory_markdown || "_No theory provided for this module._"}
                          </ReactMarkdown>
                      </div>
                  )}

                  {/* MIND MAP TAB */}
                  {activeTab === 'map' && (
                      <div>
                          <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-blue-500" />
                              Use your mouse to drag and zoom. Click nodes to expand or collapse learning branches for active recall!
                          </p>
                          {activeWorkbook.mermaid_graph_code ? (
                              <MindMapRenderer markdown={activeWorkbook.mermaid_graph_code} />
                          ) : (
                              <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">No interactive map available for this topic.</div>
                          )}
                      </div>
                  )}

                  {/* TRICKS TAB */}
                  {activeTab === 'tricks' && (
                      <div className="prose prose-purple md:prose-lg max-w-none p-8 bg-purple-50/50 rounded-2xl border border-purple-100">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {activeWorkbook.tricks_and_mnemonics || "_No specific tricks found._"}
                          </ReactMarkdown>
                      </div>
                  )}

                  {/* VIDEOS TAB */}
                  {activeTab === 'videos' && (
                      <div className="space-y-8">
                          <div className="mb-6 border-b pb-4">
                              <h3 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2">
                                  <PlayCircle className="w-6 h-6 text-red-500" />
                                  Curated Video Resources
                              </h3>
                              <p className="text-gray-600 mt-2">Deepen your understanding with highly-rated tutorials fetched dynamically.</p>
                          </div>

                          {isFetchingVideos ? (
                              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed">
                                  <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
                                  <p className="text-gray-600 font-semibold">Searching YouTube for the best tutorials...</p>
                              </div>
                          ) : activeVideo ? (
                              <div className="space-y-6">
                                  <div className="flex flex-col gap-4">
                                      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
                                          <iframe 
                                              className="absolute top-0 left-0 w-full h-full"
                                              src={`https://www.youtube.com/embed/${activeVideo.videoId}?rel=0&autoplay=0`} 
                                              title={activeVideo.title}
                                              frameBorder="0" 
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                              allowFullScreen
                                          ></iframe>
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-2xl text-[#1e3a5f] mt-2">{activeVideo.title}</h4>
                                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                              <span className="font-bold bg-gray-100 px-3 py-1 rounded-md text-gray-800">{activeVideo.author?.name || "YouTube Creator"}</span>
                                              <span>📅 {activeVideo.ago || "Recent"}</span>
                                          </div>
                                      </div>
                                  </div>

                                  {moduleVideos.length > 1 && (
                                      <div className="pt-8 border-t mt-8">
                                          <h4 className="font-bold text-lg text-[#1e3a5f] mb-4">Explore More Tutorials</h4>
                                          <div className="grid gap-4 md:grid-cols-2">
                                              {moduleVideos.filter(v => v.videoId !== activeVideo.videoId).map((v: any, i: number) => (
                                                  <button 
                                                      key={i} 
                                                      onClick={() => setActiveVideo(v)}
                                                      className="flex gap-4 p-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-red-300 transition-all text-left group"
                                                  >
                                                      <div className="w-32 aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                                          <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                      </div>
                                                      <div className="flex flex-col justify-center flex-1">
                                                          <h4 className="font-bold text-[#1e3a5f] text-sm line-clamp-2 group-hover:text-red-600 transition-colors">{v.title}</h4>
                                                          <p className="text-xs text-gray-500 mt-1 font-medium">{v.author?.name || "YouTube"}</p>
                                                      </div>
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">No video resources found for this topic.</div>
                          )}
                      </div>
                  )}

                  {/* PRACTICE TAB */}
                  {activeTab === 'practice' && (
                      <div className="space-y-8">
                          <p className="text-gray-600 mb-6 text-lg">Test your understanding with these focused module questions:</p>
                          {(activeWorkbook.practice_questions || []).length > 0 ? (
                              activeWorkbook.practice_questions.map((q: any, i: number) => (
                                  <div key={i} className="p-8 border rounded-xl bg-white shadow-sm">
                                      <div className="prose prose-lg max-w-none mb-6 font-medium text-[#1e3a5f]">
                                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`**Q${i+1}.** ${q.text}`}</ReactMarkdown>
                                      </div>
                                      <div className="space-y-3 mb-8 ml-4">
                                          {Object.entries(q.options || {}).map(([key, val]) => (
                                              <div key={key} className="flex gap-4 p-3 rounded-lg border border-transparent hover:bg-gray-50 transition-colors">
                                                  <span className="font-bold text-gray-500 w-6 shrink-0">{key}:</span> 
                                                  <div className="prose prose-sm max-w-none text-gray-700">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{val as string}</ReactMarkdown>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                      <details className="group">
                                          <summary className="text-sm font-bold text-[#7c3aed] cursor-pointer hover:text-purple-800 flex items-center gap-2 bg-purple-50 p-3 rounded-lg w-max transition-colors">
                                              Show Answer & Explanation <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                          </summary>
                                          <div className="mt-4 p-6 bg-gray-50 border border-gray-100 rounded-xl">
                                              <p className="text-base font-bold text-green-700 mb-4 pb-4 border-b border-gray-200">Correct Answer: {q.correct_answer}</p>
                                              <div className="prose prose-base max-w-none text-gray-600">
                                                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown>
                                              </div>
                                          </div>
                                      </details>
                                  </div>
                              ))
                          ) : (
                              <div className="p-12 text-center text-gray-500 bg-white border rounded-lg">No specific practice questions mapped to this module yet.</div>
                          )}
                      </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}