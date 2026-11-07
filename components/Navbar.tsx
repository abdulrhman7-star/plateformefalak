"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Play, 
  Film, 
  Tv, 
  Search, 
  Code2, 
  Menu, 
  X, 
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import EmbedModal from './EmbedModal';
import { PWAInstallButton } from './PWAInstallButton';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  // If in /embed, do not render navbar
  if (pathname?.startsWith('/embed')) {
    return null;
  }

  const handleNavClick = (tab: 'all' | 'movies' | 'series' | 'history') => {
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push(`/?tab=${tab}`);
    } else {
      // Dispatch a custom event to notify AkwamApp
      window.dispatchEvent(new CustomEvent('nav-tab-change', { detail: { tab } }));
      if (tab === 'movies') {
        const el = document.getElementById('movies-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'series') {
        const el = document.getElementById('series-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'history') {
        const el = document.getElementById('watch-history-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      window.dispatchEvent(new CustomEvent('nav-search', { detail: { query: searchQuery.trim() } }));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Zone 1: Single Brand element */}
          <Link 
            href="/"
            onClick={() => handleNavClick('all')}
            className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                Fam<span className="text-blue-500">Flix</span>
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <button
              onClick={() => handleNavClick('all')}
              className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الرئيسية
            </button>
            <button
              onClick={() => handleNavClick('movies')}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Film className="w-4 h-4 text-blue-400" />
              الأفلام
            </button>
            <button
              onClick={() => handleNavClick('series')}
              className="flex items-center gap-1.5 hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-purple-400" />
              المسلسلات
            </button>
            <Link
              href="/falak"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-rose-400 transition-colors whitespace-nowrap shrink-0"
            >
              صفحة Falak
            </Link>
            <button
              onClick={() => handleNavClick('history')}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              سجل المشاهدة
            </button>
            <Link
              href="/watch?url=https%3A%2F%2Fakwam.ss%2Fmovies&title=%D9%85%D8%B4%D8%A7%D9%87%D8%AF%D8%A9+%D9%85%D8%A8%D8%A7%D8%B4%D8%B1%D8%A9"
              className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 hidden lg:inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              مشغل سريع
            </Link>
          </nav>

          {/* Zone 3: Quick Search & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Inline Quick Search Form on desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative max-w-xs">
              <input
                type="text"
                placeholder="بحث سريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 md:w-56 bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:w-64 transition-all"
              />
              <button 
                type="submit" 
                className="absolute left-2 text-gray-400 hover:text-white transition-colors"
                title="بحث"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Embed Generator Trigger */}
            <button
              onClick={() => setIsEmbedOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0"
              title="توليد كود التضمين للمواقع"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كود التضمين</span>
            </button>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/80 bg-gray-950/95 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ابحث عن فيلم أو مسلسل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-1 pt-2">
              <button
                onClick={() => handleNavClick('all')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-200 hover:bg-gray-800 hover:text-white text-right"
              >
                <Play className="w-4 h-4 text-blue-400" />
                <span>الرئيسية</span>
              </button>
              <Link
                href="/falak"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-300 hover:bg-gray-800 hover:text-white text-right"
              >
                <Film className="w-4 h-4 text-rose-400" />
                <span>صفحة Falak</span>
              </Link>
              <button
                onClick={() => handleNavClick('movies')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-200 hover:bg-gray-800 hover:text-white text-right"
              >
                <Film className="w-4 h-4 text-blue-400" />
                <span>الأفلام العربية والأجنبية</span>
              </button>
              <button
                onClick={() => handleNavClick('series')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-200 hover:bg-gray-800 hover:text-white text-right"
              >
                <Tv className="w-4 h-4 text-purple-400" />
                <span>المسلسلات الكاملة</span>
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-200 hover:bg-gray-800 hover:text-white text-right"
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>سجل المشاهدة</span>
              </button>
              <div className="pt-2">
                <PWAInstallButton label="تثبيت التطبيق على جوالك" />
              </div>
            </div>
          </div>
        )}
      </header>

      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        defaultVideoUrl="https://akwam.ss/movies"
        defaultTitle="مشغل فيديو متجاوب"
      />
    </>
  );
}
