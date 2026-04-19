'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      // Triggers the NextAuth Google flow we set up in auth-options.ts
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Log in to continue your exam preparation</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* New Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || loading}
            className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value ?? '')}
                  disabled={loading || isGoogleLoading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            {/* 🚀 UPDATED PASSWORD FIELD WITH FORGOT PASSWORD LINK */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#2563eb] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value ?? '')}
                  disabled={loading || isGoogleLoading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1e3a5f] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#2563eb] font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}