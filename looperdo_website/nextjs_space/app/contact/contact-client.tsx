'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SectionReveal from '@/components/section-reveal';

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res?.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await res?.json?.();
        setError(data?.error ?? 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Contact error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MessageSquare className="w-10 h-10 mx-auto mb-4 text-[#60b5ff]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Get in Touch</h1>
            <p className="text-blue-100/80 max-w-lg mx-auto">Have a question or suggestion? We&apos;d love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50/50 py-16">
        <div className="mx-auto max-w-[600px] px-4">
          <SectionReveal>
            {success ? (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 px-6 py-2 bg-[#2563eb] text-white font-medium rounded-md hover:bg-[#1e3a5f] transition-colors text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={form?.name ?? ''}
                        onChange={(e) => setForm({ ...(form ?? {}), name: e?.target?.value ?? '' })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={form?.email ?? ''}
                        onChange={(e) => setForm({ ...(form ?? {}), email: e?.target?.value ?? '' })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={form?.subject ?? ''}
                      onChange={(e) => setForm({ ...(form ?? {}), subject: e?.target?.value ?? '' })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm"
                      placeholder="What is this about?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={form?.message ?? ''}
                      onChange={(e) => setForm({ ...(form ?? {}), message: e?.target?.value ?? '' })}
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm resize-none"
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1e3a5f] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Your message is stored securely. We typically respond within 24 hours.</p>
                </form>
              </div>
            )}
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
