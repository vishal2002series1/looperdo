'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, RefreshCw, LogOut, User, LayoutDashboard } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export default function Header() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1e3a5f] group-hover:text-[#2563eb] transition-colors">LooperDo</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link: any) => (
            <Link
              key={link?.href}
              href={link?.href ?? '/'}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === link?.href
                  ? 'text-[#2563eb] bg-blue-50'
                  : 'text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50'
              }`}
            >
              {link?.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {status === 'authenticated' && session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50 rounded-md transition-colors"
              >
                <User className="w-4 h-4" /> {session?.user?.name?.split?.(' ')?.[0] ?? 'Profile'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#1e3a5f] hover:text-[#2563eb] rounded-md transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1e3a5f] rounded-md transition-colors shadow-sm"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link?.href}
                  href={link?.href ?? '/'}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link?.href ? 'text-[#2563eb] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link?.label}
                </Link>
              ))}
              <hr className="my-2" />
              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-[#2563eb]">
                    Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-2 text-sm font-medium text-left text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-[#1e3a5f]">
                    Log In
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-md text-center">
                    Start Free
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
