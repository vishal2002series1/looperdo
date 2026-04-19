'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4 text-center">Reset Password</h1>
        {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm text-center">{message}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <button disabled={loading} className="w-full bg-[#ea580c] text-white font-bold py-3 rounded-xl disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}