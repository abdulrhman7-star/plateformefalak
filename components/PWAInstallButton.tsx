'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC<{ label?: string }> = ({ label }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        title="تثبيت تطبيق Moviey على جهازك"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label || 'تثبيت التطبيق PWA'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/10 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          title="كيفية تثبيت التطبيق على iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-red-500" />
          <span>{label || 'تثبيت التطبيق'}</span>
        </button>

        <AnimatePresence>
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowIOSGuide(false)}
              dir="rtl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm rounded-3xl bg-[#13151f] p-6 shadow-2xl border border-white/10 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">تثبيت التطبيق على iPhone / iPad</h3>
                  <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-white transition p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Share className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed pt-1">
                      1. اضغط على زر <strong className="text-white">المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <span className="text-red-500 font-bold text-base">+</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed pt-1">
                      2. قم بالتمرير لأسفل واختر <strong className="text-white">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-6 w-full rounded-2xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white transition shadow-lg shadow-red-600/30"
                >
                  فهمت ذلك
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
};
