'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

// --- LaTeX rendering imports ---
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function AssessmentClient({ testId }: { testId: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [testData, setTestData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    
    // Pull the generated test from browser storage
    const storedTest = sessionStorage.getItem('activeTest');
    if (storedTest) {
      setTestData(JSON.parse(storedTest));
    } else {
      // If they refresh the page or bypass the dashboard, kick them back
      alert("Test session expired or not found. Please generate a new test.");
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (!testData || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;

  const handleOptionSelect = (optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/evaluate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certification: testData.certificationSlug,
          questions: testData.questions,
          student_answers: answers,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        sessionStorage.removeItem('activeTest');
        sessionStorage.setItem('lastResult', JSON.stringify(result));
        router.push('/results'); 
      } else {
        alert(`Evaluation Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Evaluation Error:", error);
      alert("Network error during evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f]">{testData.certificationSlug} Assessment</h1>
            <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {testData.questions.length}</p>
          </div>
          <div className="text-right">
             <div className="w-10 h-10 rounded-full border-4 border-[#2563eb] flex items-center justify-center text-sm font-bold text-[#2563eb]">
               {Math.round(((currentQuestionIndex + 1) / testData.questions.length) * 100)}%
             </div>
          </div>
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm mb-6"
        >
          {/* Render Shared Context if applicable */}
          {currentQuestion.shared_context && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100 prose prose-sm max-w-none text-blue-900">
               <h3 className="text-xs font-bold uppercase text-blue-800 mb-2">Context Passage</h3>
               <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                 {currentQuestion.shared_context}
               </ReactMarkdown>
            </div>
          )}

          {/* 🚀 Render Figure/Image if the backend provides one */}
          {currentQuestion.image && (
            <div className="mb-6 flex justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <img 
                src={currentQuestion.image} 
                alt="Question Figure" 
                className="max-w-full h-auto object-contain max-h-[400px] rounded shadow-sm"
              />
            </div>
          )}

          {/* Question Text (LaTeX Enabled) */}
          <div className="text-lg font-medium text-[#1e3a5f] mb-6 prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentQuestion.text}
            </ReactMarkdown>
          </div>

          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = answers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-[#2563eb] bg-blue-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 shrink-0 rounded flex items-center justify-center text-sm font-bold mt-0.5 ${
                       isSelected ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {key}
                    </div>
                    <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {value as string}
                      </ReactMarkdown>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < testData.questions.length}
              className="px-8 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {isSubmitting ? "Evaluating..." : "Submit Test"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 font-bold text-white bg-[#2563eb] hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}