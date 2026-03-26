import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1f33] text-gray-300">
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LooperDo</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Know exactly when you&apos;re ready to pass. Adaptive exam preparation that builds true confidence.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
              <div className="flex flex-col gap-2">
                <Link href="/certifications" className="text-sm text-gray-400 hover:text-white transition-colors">Certifications</Link>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <div className="flex flex-col gap-2">
                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-700/50 text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} LooperDo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
