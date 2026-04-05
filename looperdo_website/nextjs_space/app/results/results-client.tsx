'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, AlertCircle, CheckCircle2, ArrowLeft, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

const WORKBOOK_MESSAGES = [
  "🔍 Researcher Agent is finding the best video resources...",
  "✍️ Author Agent is drafting theory and mnemonics...",
  "🎨 Designer Agent is mapping the interactive mind map...",
  "🗂️ Curator Agent is pulling relevant practice questions...",
  "💾 Compiler is caching your workbook..."
];

export default function ResultsClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [resultData, setResultData] = useState<any>(null);
  
  const [isGeneratingWorkbook, setIsGeneratingWorkbook] = useState(false);
  const [workbookMessageIndex, setWorkbookMessageIndex] = useState(0);
  const [activeWorkbook, setActiveWorkbook] = useState<any>(null);
  
  // State to track which question's explanation is expanded
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    
    const storedResult = sessionStorage.getItem('lastResult');
    if (storedResult) { 
      setResultData(JSON.parse(storedResult));
    } else {
      router.replace('/dashboard');
    }
  }, [status, router]);

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
    setIsGeneratingWorkbook(true);
    try {
      const response = await fetch('/api/build-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: mistake.subject || 'General',
          topic: mistake.topic || 'General',
          sub_topic: mistake.sub_topic,
          difficulty_level: mistake.difficulty || 3,
          target_exam: 'UPSC'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setActiveWorkbook(data.workbook);
      } else {
        alert(`Failed to generate workbook: ${data.error}`);
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
          <div className="inline-block px-8 py-4 bg-gray-50 rounded-2xl">
            <span className="text-5xl font-black text-[#2563eb]">{resultData.score}%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-[#7c3aed]">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7c3aed]" /> AI Study Plan & Recommendations
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
            {resultData.study_plan || "No specific study plan was generated for this session."}
          </p>
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

        {/* --- NEW: Detailed Breakdown Section --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg p-6 shadow-sm">
           <h2 className="text-lg font-bold text-[#1e3a5f] mb-6 border-b pb-4">Detailed Breakdown</h2>
           
           <div className="space-y-4">
              {(resultData.graded_results || []).map((result: any, index: number) => {
                 const isExpanded = expandedQuestion === result.question_id;
                 
                 return (
                    <div key={index} className={`border rounded-lg overflow-hidden transition-colors ${result.is_correct ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                       <button 
                          onClick={() => toggleExpand(result.question_id)}
                          className="w-full text-left p-4 flex items-start gap-4 hover:bg-black/5 transition-colors"
                       >
                          <div className="mt-1">
                             {result.is_correct ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <p className="font-medium text-[#1e3a5f] line-clamp-2 pr-4">{result.text}</p>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                             </div>
                             <p className="text-xs text-gray-500 mt-2">
                                Taxonomy: {result.subject} {'>'} {result.topic} {'>'} {result.sub_topic} | Difficulty: {result.difficulty}
                             </p>
                          </div>
                       </button>

                       <AnimatePresence>
                          {isExpanded && (
                             <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-gray-100 bg-white"
                             >
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
                                   
                                   <div className="bg-gray-50 p-4 rounded-md">
                                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Explanation</p>
                                      {/* Note: Use KaTeX renderer here in the future if LaTeX formatting is needed */}
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                         {result.explanation || "No detailed explanation available."}
                                      </p>
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
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setActiveWorkbook(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b pb-4">
                <div>
                   <h2 className="text-xl font-bold text-[#1e3a5f]">{activeWorkbook.sub_topic}</h2>
                   <p className="text-sm text-gray-500">Level {activeWorkbook.difficulty_level} • {activeWorkbook.target_exam}</p>
                </div>
                <button onClick={() => setActiveWorkbook(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Theory</h3>
                   <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {activeWorkbook.theory_markdown}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Mnemonics & Tricks</h3>
                   <div className="p-4 bg-purple-50 rounded-lg text-sm text-purple-900 whitespace-pre-wrap">
                      {activeWorkbook.tricks_and_mnemonics}
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}