'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const AVAILABLE_EXAMS = [
  { id: "AWS Solutions Architect Associate", name: "AWS Solutions Architect", desc: "Master cloud infrastructure and design resilient AWS architectures." },
  { id: "Microsoft Azure Administrator (AZ-104)", name: "Azure Administrator", desc: "Manage cloud services that span storage, security, and networking." },
  { id: "Google Cloud Associate Cloud Engineer", name: "Google Cloud Engineer", desc: "Deploy applications, monitor operations, and manage enterprise solutions." },
  { id: "Microsoft Power BI Data Analyst (PL-300)", name: "Power BI Analyst", desc: "Deliver actionable insights and build stunning data visualizations." },
  { id: "Lean Six Sigma Black Belt (IASSC)", name: "Lean Six Sigma", desc: "Lead complex improvement projects and master data analysis." },
  { id: "PMI Project Management Professional (PMP)", name: "PMP Certification", desc: "Validate your project leadership experience and expertise." }
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  const handleConfirm = async () => {
    if (!selectedExam || !session?.user?.email) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, exam: selectedExam })
      });

      if (res.ok) {
        sessionStorage.setItem('lastViewedExam', selectedExam);
        router.push('/dashboard');
      } else {
        alert("Failed to save selection.");
        setIsSaving(false);
      }
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl max-w-4xl w-full p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1e3a5f] mb-3">Welcome to LooperDo!</h1>
          <p className="text-gray-500 text-lg">Choose your free certification track to begin your adaptive learning journey.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {AVAILABLE_EXAMS.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all relative ${
                selectedExam === exam.id 
                  ? 'border-blue-500 bg-blue-50/30 shadow-md ring-4 ring-blue-50' 
                  : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
              }`}
            >
              {selectedExam === exam.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-blue-500" />}
              <h3 className={`font-bold text-lg mb-2 pr-6 ${selectedExam === exam.id ? 'text-blue-900' : 'text-gray-800'}`}>
                {exam.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{exam.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center border-t pt-8">
          <button
            onClick={handleConfirm}
            disabled={!selectedExam || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Setting up workspace...</> : <>Start Learning <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}