"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Download, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Code2, 
  Share2, 
  Zap, 
  Shield, 
  Copy, 
  Check 
} from 'lucide-react';
import EmbedModal from './EmbedModal';
import { addToWatchHistory } from '@/lib/history';

interface VideoLink {
  quality: string;
  url: string;
}

interface WatchClientPlayerProps {
  initialUrl: string;
  title: string;
  image?: string;
}

export default function WatchClientPlayer({ initialUrl, title, image }: WatchClientPlayerProps) {
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [selectedQualityIdx, setSelectedQualityIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(Boolean(initialUrl));
  const [error, setError] = useState<string>(!initialUrl ? 'لم يتم تزويد رابط صالح للمشاهدة' : '');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [streamMode, setStreamMode] = useState<'direct' | 'proxy'>('direct');
  
  const [isEmbedOpen, setIsEmbedOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchLinks = () => {
    if (!initialUrl) {
      setError('لم يتم تزويد رابط صالح للمشاهدة');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setVideoError(false);

    fetch(`/api/get-link?url=${encodeURIComponent(initialUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setVideoLinks(data.data);
          setSelectedQualityIdx(0);
        } else {
          setError(data.error || 'تعذر استخراج روابط المشاهدة المباشرة');
        }
      })
      .catch(() => {
        setError('حدث خطأ أثناء الاتصال بالخادم لجلب روابط التشغيل');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isCancelled = false;
    if (!initialUrl) return;

    fetch(`/api/get-link?url=${encodeURIComponent(initialUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setVideoLinks(data.data);
            setSelectedQualityIdx(0);
            addToWatchHistory({ title, url: initialUrl, image });
          } else {
            setError(data.error || 'تعذر استخراج روابط المشاهدة المباشرة');
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('حدث خطأ أثناء الاتصال بالخادم لجلب روابط التشغيل');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [initialUrl, title, image]);

  const activeVideoUrl = videoLinks[selectedQualityIdx]?.url;

  const switchQuality = (idx: number) => {
    if (!videoLinks[idx]) return;
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    const isPaused = videoRef.current ? videoRef.current.paused : false;

    setSelectedQualityIdx(idx);
    setVideoError(false);

    if (videoRef.current) {
      const targetUrl = videoLinks[idx].url;
      videoRef.current.src = streamMode === 'direct' ? targetUrl : `/api/stream?url=${encodeURIComponent(targetUrl)}`;
      videoRef.current.currentTime = currentTime;
      if (!isPaused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 min-h-screen text-white font-sans" dir="rtl">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-800 px-4 py-2 rounded-xl transition-colors border border-gray-700/50 text-sm font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700/60 transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">تم نسخ الرابط!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>مشاركة الصفحة</span>
            </>
          )}
        </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-black mb-6 text-center text-white drop-shadow-sm">
        {title || 'مشاهدة الفيديو'}
      </h1>

      {loading ? (
        <div className="aspect-video bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
          <span className="text-sm font-medium">جاري استخراج رابط البث المباشر الموقّع...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 rounded-2xl text-center font-medium my-6 flex flex-col items-center gap-3 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-base font-bold">{error}</p>
          <button
            onClick={fetchLinks}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      ) : videoLinks.length > 0 ? (
        <div className="space-y-6">
          {/* Main Video Element */}
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
            <video
              key={`${streamMode}-${activeVideoUrl}`}
              ref={videoRef}
              controls
              autoPlay
              playsInline
              poster={image || undefined}
              className="w-full h-full object-contain"
              src={streamMode === 'direct' ? activeVideoUrl : `/api/stream?url=${encodeURIComponent(activeVideoUrl)}`}
              controlsList="nodownload"
              onError={() => {
                if (streamMode === 'direct') {
                  console.warn('Direct stream failed, falling back to proxy...');
                  setStreamMode('proxy');
                } else {
                  setVideoError(true);
                }
              }}
              onPlay={() => setVideoError(false)}
            >
              <source src={activeVideoUrl} type="video/mp4" />
              متصفحك لا يدعم مشغل الفيديو.
            </video>
          </div>

          {/* Mode Switcher Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
              <span className="font-semibold text-gray-400">وضع التدفق:</span>
              <div className="flex items-center bg-gray-800 p-1 rounded-lg border border-gray-700/60">
                <button
                  onClick={() => {
                    setStreamMode('direct');
                    setVideoError(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    streamMode === 'direct'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="تشغيل فوري مباشر من المصدر"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>مباشر (Direct)</span>
                </button>
                <button
                  onClick={() => {
                    setStreamMode('proxy');
                    setVideoError(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    streamMode === 'proxy'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="تشغيل عبر سيرفر البروكسي الداخلي"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-300" />
                  <span>بروكسي (Proxy)</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-400 font-mono dir-ltr">
              {streamMode === 'direct' ? '⚡ Native Direct Stream (Zero Latency)' : '🛡️ Edge Buffered Proxy'}
            </div>
          </div>

          {videoError && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-xl text-center text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <p className="font-semibold">تعذر التشغيل أو انتهت صلاحية الرابط المباشر من المصدر.</p>
                <p className="text-xs text-yellow-400/80 mt-1">انقر على &quot;تحديث الرابط&quot; لتوليد رابط مباشر جديد فوراً.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLinks}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  تحديث الرابط
                </button>
              </div>
            </div>
          )}

          {/* Controls Bar: Qualities & Embed & Download */}
          <div className="bg-gray-800/90 border border-gray-700/60 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span className="text-gray-400 text-sm font-medium ml-2">الجودة المتوفرة:</span>
              {videoLinks.map((link, idx) => (
                <button
                  key={`watch-quality-${idx}`}
                  onClick={() => switchQuality(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedQualityIdx === idx
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.quality}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-end">
              <button
                onClick={() => setIsEmbedOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20"
              >
                <Code2 className="w-4 h-4" />
                <span>كود التضمين</span>
              </button>

              {activeVideoUrl && (
                <a
                  href={activeVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold text-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح بالمصدر</span>
                </a>
              )}

              <a
                href={`/api/download?url=${encodeURIComponent(activeVideoUrl)}&title=${encodeURIComponent(title || 'video')}`}
                download
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-green-600/20"
              >
                <Download className="w-5 h-5" />
                تحميل ({videoLinks[selectedQualityIdx]?.quality || 'الفيديو'})
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        defaultVideoUrl={activeVideoUrl || initialUrl}
        defaultTitle={title}
      />
    </div>
  );
}
