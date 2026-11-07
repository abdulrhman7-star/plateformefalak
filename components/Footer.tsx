'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Play, Zap, Shield, Heart, Globe, Search, Bookmark } from 'lucide-react';
import { LangCode } from '@/types';
import { T } from '@/lib/i18n';

interface FooterProps {
  lang?: LangCode;
  onTabChange?: (tab: 'home' | 'search' | 'favorites') => void;
  onSelectGenre?: (genreId: string) => void;
}

export default function Footer({ lang = 'ar', onTabChange, onSelectGenre }: FooterProps = {}) {
  const pathname = usePathname();
  const t = T[lang] || T.ar;

  // Do not render footer on embed player page
  if (pathname?.startsWith('/embed')) {
    return null;
  }

  const handleNavClick = (tab: 'home' | 'search' | 'favorites', e: React.MouseEvent) => {
    if (onTabChange) {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  const handleGenreClick = (genreId: string, e: React.MouseEvent) => {
    if (onSelectGenre) {
      e.preventDefault();
      onSelectGenre(genreId);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#07080b] border-t border-white/10 text-gray-400 font-sans mt-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 text-white select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                فلك <span className="text-red-500">TV</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t.footer_about_text || 'منصة فلك توفر تجربة سينمائية مجانية متميزة مع ترجمة عربية تلقائية ذكية وسيرفرات فائقة السرعة.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === 'ar' ? 'خوادم البث المباشر نشطة ومحدثة' : 'Streaming nodes operational'}</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {t.footer_links || 'روابط سريعة'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={(e) => handleNavClick('home', e)}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-red-500" />
                  <span>{t.nav_home || 'الرئيسية'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleNavClick('search', e)}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-red-500" />
                  <span>{t.btn_search || 'البحث الفوري'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleNavClick('favorites', e)}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-red-500" />
                  <span>{t.my_favorites || 'قائمة المحفوظات'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {t.footer_genres || 'أشهر التصنيفات'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: '28', nameAr: 'أكشن', nameEn: 'Action' },
                { id: '12', nameAr: 'مغامرة', nameEn: 'Adventure' },
                { id: '35', nameAr: 'كوميديا', nameEn: 'Comedy' },
                { id: '18', nameAr: 'دراما', nameEn: 'Drama' },
                { id: '27', nameAr: 'رعب', nameEn: 'Horror' },
                { id: '878', nameAr: 'خيال علمي', nameEn: 'Sci-Fi' },
                { id: '16', nameAr: 'رسوم متحركة', nameEn: 'Animation' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={(e) => handleGenreClick(g.id, e)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-300 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  {lang === 'ar' ? g.nameAr : g.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Disclaimer & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {lang === 'ar' ? 'إخلاء مسؤولية' : 'Legal Disclaimer'}
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {lang === 'ar'
                ? 'جميع ملفات الفيديو والروابط المعروضة في هذا الموقع يتم فهرستها وجلبها تلقائياً من خوادم ومصادر خارجية عامة على شبكة الإنترنت. لا تقوم المنصة برفع أو تخزين أي وسائط محمية على خوادمها الخاصة.'
                : 'All media indices are automatically gathered from third-party public sources across the web. Falak TV does not host or store any copyright media on its own servers.'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p suppressHydrationWarning>
            © {currentYear} Falak TV. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>{t.footer_made || 'صُمم بشغف لعشاق السينما'}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
