'use client';

import React from 'react';
import { Play, Film, Sparkles, Zap, Globe, Tv } from 'lucide-react';
import { LangCode } from '@/types';
import { T } from '@/lib/i18n';

interface HeroProps {
  lang?: LangCode;
  onExplore?: () => void;
}

export default function Hero({ lang = 'ar', onExplore }: HeroProps) {
  const t = T[lang] || T.ar;

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      const el = document.getElementById('movies-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[560px] flex items-center justify-center overflow-hidden bg-[#0b0c10]">
      {/* Cinematic Background Image with Dark Vignette & Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_cinema.jpg"
          alt="Falak Cinema"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10]/80 via-transparent to-[#0b0c10]/80" />
      </div>

      {/* Ambient Red Glow Halo */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[280px] sm:h-[350px] bg-red-600/20 blur-[130px] rounded-full pointer-events-none" 
        aria-hidden="true"
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md shadow-lg shadow-red-950/30">
          <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
          <span>{t.hero_badge || '✨ تجربة سينمائية مجانية بترجمة عربية تلقائية'}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.2] mb-5">
          {t.hero_title_1 || 'شاهد عالمك السينمائي'} <br />
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
            {t.hero_title_2 || 'على منصة فلك TV'}
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed mb-8">
          {t.hero_desc || 'منصتك المتميزة لمتابعة أحدث الأفلام العالمية والمسلسلات الحصرية بجودة فائقة وسيرفرات سريعة وترجمة ذكية.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <button
            type="button"
            onClick={handleExplore}
            className="group inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span>{t.btn_browse || 'تصفح الأعمال الآن'}</span>
          </button>

          <button
            type="button"
            onClick={handleExplore}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white font-semibold text-sm sm:text-base border border-white/15 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Film className="w-4 h-4 text-red-400" />
            <span>{t.sort_popular || 'الأكثر شعبية'}</span>
          </button>
        </div>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10 text-xs sm:text-sm text-gray-400 font-medium">
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{lang === 'ar' ? 'سيرفرات فائقة السرعة' : 'Ultra-Fast Servers'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{lang === 'ar' ? 'ترجمات ذكية مدمجة' : 'Smart Subtitles'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5">
            <Film className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">{lang === 'ar' ? 'جودة 1080p & 4K' : '1080p & 4K UHD'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5">
            <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{lang === 'ar' ? 'تطبيق ويب تقدمي PWA' : 'PWA App Ready'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
