'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password, token }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
    if (res.ok) {
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  if (!token) return <div className="text-center mt-20">Missing token!</div>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4 text-center">Enter New Password</h1>
        {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm text-center">{message}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <button disabled={loading} className="w-full bg-[#2563eb] text-white font-bold py-3 rounded-xl disabled:opacity-50">
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}