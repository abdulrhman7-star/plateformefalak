"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Download, 
  Film, 
  Tv, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Code2, 
  Share2,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Trash2
} from 'lucide-react';
import EmbedModal from './EmbedModal';
import { 
  HistoryItem, 
  useWatchHistory, 
  addToWatchHistory, 
  clearWatchHistory, 
  removeFromWatchHistory 
} from '@/lib/history';

interface MediaItem {
  title: string;
  url: string;
  image: string;
  rating?: string;
  quality?: string;
}

interface VideoLink {
  quality: string;
  url: string;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'منذ لحظات';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
}

export default function AkwamApp() {
  const [view, setView] = useState<'home' | 'search' | 'series' | 'watch'>('home');
  const [homeTab, setHomeTab] = useState<'all' | 'movies' | 'series' | 'history'>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [series, setSeries] = useState<MediaItem[]>([]);
  const watchHistory = useWatchHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [episodes, setEpisodes] = useState<MediaItem[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [selectedQualityIdx, setSelectedQualityIdx] = useState<number>(0);
  const [videoError, setVideoError] = useState(false);
  const [streamMode, setStreamMode] = useState<'direct' | 'proxy'>('direct');
  
  // Embed Modal State
  const [isEmbedOpen, setIsEmbedOpen] = useState<boolean>(false);
  const [embedVideoUrl, setEmbedVideoUrl] = useState<string>('');
  const [embedTitle, setEmbedTitle] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchHomeData = async () => {
    setLoading(true);
    setError('');
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        fetch('/api/movies?page=1').then(res => res.json()),
        fetch('/api/series?page=1').then(res => res.json())
      ]);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (seriesRes.success) setSeries(seriesRes.data);
      if (!moviesRes.success && !seriesRes.success) {
        setError(moviesRes.error || seriesRes.error || 'تعذر جلب البيانات');
      }
    } catch (e: any) {
      console.error(e);
      setError('حدث خطأ أثناء جلب البيانات من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (view === 'home' && movies.length === 0 && series.length === 0) {
      const load = async () => {
        setLoading(true);
        try {
          const [moviesRes, seriesRes] = await Promise.all([
            fetch('/api/movies?page=1').then(res => res.json()),
            fetch('/api/series?page=1').then(res => res.json())
          ]);
          if (!isCancelled) {
            if (moviesRes.success) setMovies(moviesRes.data || []);
            if (seriesRes.success) setSeries(seriesRes.data || []);
          }
        } catch (e) {
          if (!isCancelled) {
            setError('حدث خطأ أثناء جلب البيانات');
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };
      load();
    }
    return () => {
      isCancelled = true;
    };
  }, [view, movies.length, series.length]);

  useEffect(() => {
    const onTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: 'all' | 'movies' | 'series' | 'history' }>;
      const tab = customEvent.detail?.tab;
      if (tab === 'movies' || tab === 'series' || tab === 'all' || tab === 'history') {
        setView('home');
        setHomeTab(tab);
        setError('');
      }
    };

    const onNavSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      const q = customEvent.detail?.query;
      if (q) {
        setQuery(q);
        setView('search');
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(q)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setResults(data.data || []);
            } else {
              setError(data.error || 'لا توجد نتائج');
            }
          })
          .catch(() => {
            setError('فشل في جلب نتائج البحث');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    window.addEventListener('nav-tab-change', onTabChange);
    window.addEventListener('nav-search', onNavSearch);

    return () => {
      window.removeEventListener('nav-tab-change', onTabChange);
      window.removeEventListener('nav-search', onNavSearch);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setView('search');
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'لا توجد نتائج');
      }
    } catch (e) {
      setError('فشل البحث في الخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = async (item: MediaItem) => {
    setCurrentMedia(item);
    setError('');
    setVideoError(false);
    
    if (item.url.includes('/series/') || item.url.includes('series')) {
      setView('series');
      setLoading(true);
      try {
        const res = await fetch(`/api/series-episodes?url=${encodeURIComponent(item.url)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEpisodes(data.data);
        } else {
          setError(data.error || 'لم يتم العثور على حلقات لهذا المسلسل');
        }
      } catch (e) {
        setError('فشل في جلب الحلقات');
      } finally {
        setLoading(false);
      }
    } else {
      // فيلم
      addToWatchHistory({
        title: item.title,
        url: item.url,
        image: item.image
      });
      fetchVideoLinks(item.url);
    }
  };

  const fetchVideoLinks = async (url: string) => {
    setView('watch');
    setLoading(true);
    setError('');
    setVideoLinks([]);
    setSelectedQualityIdx(0);
    setVideoError(false);

    try {
      const res = await fetch(`/api/get-link?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setVideoLinks(data.data);
        if (currentMedia) {
          addToWatchHistory({
            title: currentMedia.title,
            url: currentMedia.url,
            image: currentMedia.image
          });
        }
      } else {
        setError(data.error || 'تعذر جلب روابط المشاهدة');
      }
    } catch (e) {
      setError('حدث خطأ أثناء استخراج روابط المشاهدة');
    } finally {
      setLoading(false);
    }
  };

  const switchQuality = (idx: number) => {
    if (!videoLinks[idx]) return;
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    const isPaused = videoRef.current ? videoRef.current.paused : false;
    
    setSelectedQualityIdx(idx);
    setVideoError(false);

    if (videoRef.current) {
      videoRef.current.src = `/api/stream?url=${encodeURIComponent(videoLinks[idx].url)}`;
      videoRef.current.currentTime = currentTime;
      if (!isPaused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div 
      id={`media-card-${encodeURIComponent(item.url)}`}
      className="group bg-gray-800/90 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/80 rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 flex flex-col"
      onClick={() => handleMediaClick(item)}
    >
      <div className="relative aspect-[2/3] w-full bg-gray-900 overflow-hidden">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder if image load fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Film className="w-10 h-10 text-gray-600" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

        {item.quality && (
          <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-bold shadow-md">
            {item.quality}
          </div>
        )}
        {item.rating && (
          <div className="absolute bottom-2 left-2 bg-gray-950/80 backdrop-blur-sm text-yellow-400 text-xs px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-md">
            <span>★</span>
            <span>{item.rating}</span>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3 flex-1 flex items-center">
        <h3 className="text-sm font-medium text-gray-200 group-hover:text-blue-400 line-clamp-2 transition-colors" title={item.title}>
          {item.title}
        </h3>
      </div>
    </div>
  );

  const activeVideoUrl = videoLinks[selectedQualityIdx]?.url;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div 
          id="app-logo-btn"
          className="text-2xl font-black text-blue-500 cursor-pointer flex items-center gap-2 select-none"
          onClick={() => { setView('home'); setQuery(''); setError(''); }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl tracking-tight text-white font-extrabold">Fam<span className="text-blue-500">Flix</span></span>
            <span className="text-[11px] text-gray-400 font-normal">مشاهدة وتحميل بدون إعلانات</span>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-1/2 max-w-xl flex shadow-xl shadow-black/20">
          <input 
            id="search-input"
            type="text" 
            placeholder="ابحث عن فيلم أو مسلسل..."
            className="flex-1 bg-gray-800/90 border border-gray-700 border-l-0 rounded-r-xl px-5 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            id="search-submit-btn"
            type="submit" 
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-l-xl transition-colors flex items-center justify-center font-medium gap-2 text-white"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">بحث</span>
          </button>
        </form>
      </header>

      {/* Tabs navigation in Home */}
      {view === 'home' && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              id="tab-all"
              onClick={() => setHomeTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                homeTab === 'all' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              id="tab-movies"
              onClick={() => setHomeTab('movies')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                homeTab === 'movies' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              الأفلام
            </button>
            <button
              id="tab-series"
              onClick={() => setHomeTab('series')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                homeTab === 'series' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              المسلسلات
            </button>
            {watchHistory.length > 0 && (
              <button
                id="tab-history"
                onClick={() => setHomeTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  homeTab === 'history' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>سجل المشاهدة</span>
                <span className="text-[11px] bg-black/40 px-2 py-0.5 rounded-full font-mono font-bold text-blue-200">
                  {watchHistory.length}
                </span>
              </button>
            )}
          </div>

          {/* Quick Embed Generator Launch Button */}
          <button
            id="open-embed-generator-btn"
            onClick={() => {
              setEmbedVideoUrl(movies[0]?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
              setEmbedTitle('فيديو متجاوب جاهز للتضمين');
              setIsEmbedOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-md shadow-purple-500/10 border border-purple-500/30"
          >
            <Code2 className="w-4 h-4 text-cyan-300" />
            <span>كود التضمين (Embed Iframe)</span>
          </button>
        </div>
      )}

      {/* Error & Loading States */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
          <p className="text-gray-400 text-sm">جاري تحميل المحتوى من المصدر...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-5 rounded-xl text-center font-medium my-6 flex flex-col items-center gap-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p>{error}</p>
          <button
            onClick={() => {
              if (view === 'home') fetchHomeData();
              else if (view === 'search') handleSearch({ preventDefault: () => {} } as any);
              else if (view === 'watch' && currentMedia) fetchVideoLinks(currentMedia.url);
              else if (view === 'series' && currentMedia) handleMediaClick(currentMedia);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded-lg text-sm transition-colors mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Main Home Content */}
      {!loading && view === 'home' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Watch History Section */}
          {(homeTab === 'all' || homeTab === 'history') && watchHistory.length > 0 && (
            <section id="watch-history-section" className="bg-gradient-to-b from-gray-800/40 to-transparent p-5 rounded-2xl border border-gray-800/80">
              <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                      <span>المشاهدة مؤخراً</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                        {watchHistory.length}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">آخر مقاطع الفيديو التي شاهدتها محفوظة على جهازك لسرعة الاستئناف</p>
                  </div>
                </div>

                <button
                  onClick={clearWatchHistory}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-800/80 hover:bg-red-600/20 hover:text-red-400 text-gray-400 rounded-xl text-xs font-semibold border border-gray-700/60 transition-all cursor-pointer"
                  title="مسح كافة عناصر سجل المشاهدة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح السجل</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchHistory.map((item, i) => (
                  <div
                    key={`history-${item.url}-${i}`}
                    className="bg-gray-800/90 hover:bg-gray-800 border border-gray-700/60 hover:border-blue-500/60 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-xl group relative flex flex-col cursor-pointer"
                    onClick={() => {
                      handleMediaClick({
                        title: item.title,
                        url: item.url,
                        image: item.image || '',
                      });
                    }}
                  >
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchHistory(item.url);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-black/70 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                        title="حذف من السجل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-semibold text-gray-200 group-hover:text-blue-400 line-clamp-2 transition-colors mb-2" title={item.title}>
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-700/50">
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <Play className="w-3 h-3 fill-current" />
                          <span>استئناف</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatRelativeTime(item.watchedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty History State when user explicitly filters by history */}
          {homeTab === 'history' && watchHistory.length === 0 && (
            <div className="text-center py-16 bg-gray-800/40 border border-gray-800 rounded-2xl">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-200 mb-1">سجل المشاهدة فارغ</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                لم تقم بمشاهدة أي مقاطع فيديو بعد. عند بدء مشاهدة أي فيلم أو مسلسل، سيتم حفظ آخر 10 مقاطع هنا تلقائياً لسرعة الوصول إليها.
              </p>
              <button
                onClick={() => setHomeTab('all')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                تصفح الأفلام والمسلسلات
              </button>
            </div>
          )}

          {(homeTab === 'all' || homeTab === 'movies') && (
            <section id="movies-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">أحدث الأفلام</h2>
                </div>
              </div>
              {movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((m, i) => <MediaCard key={`movie-${i}`} item={m} />)}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">لا توجد أفلام معروضة حالياً.</p>
              )}
            </section>
          )}

          {(homeTab === 'all' || homeTab === 'series') && (
            <section id="series-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">أحدث المسلسلات</h2>
                </div>
              </div>
              {series.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {series.map((s, i) => <MediaCard key={`series-${i}`} item={s} />)}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">لا توجد مسلسلات معروضة حالياً.</p>
              )}
            </section>
          )}
        </div>
      )}

      {/* Search Results */}
      {!loading && view === 'search' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              نتائج البحث عن: <span className="text-blue-400">{query}</span>
            </h2>
            <button 
              onClick={() => { setView('home'); setQuery(''); }} 
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </button>
          </div>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((r, i) => <MediaCard key={`search-${i}`} item={r} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/40 border border-gray-800 rounded-2xl">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">لم يتم العثور على نتائج تطابق بحثك.</p>
            </div>
          )}
        </div>
      )}

      {/* Series Episodes List */}
      {!loading && view === 'series' && currentMedia && (
        <div className="animate-in fade-in duration-300">
          <button 
            id="back-to-home-btn"
            onClick={() => setView('home')} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 bg-gray-800/80 hover:bg-gray-800 px-4 py-2 rounded-xl transition-colors border border-gray-700/50"
          >
            <ArrowRight className="w-4 h-4" /> عودة للقائمة
          </button>
          
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            {currentMedia.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={currentMedia.image} 
                alt={currentMedia.title} 
                className="w-44 md:w-52 rounded-xl shadow-xl border border-gray-700" 
                referrerPolicy="no-referrer" 
              />
            )}
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold mb-3">
                <Tv className="w-3.5 h-3.5" />
                مسلسل
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{currentMedia.title}</h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                اختر الحلقة المطلوبة للمشاهدة المباشرة بدون إعلانات أو التحميل بأعلى جودة متوفرة.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>قائمة الحلقات</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full border border-gray-700">{episodes.length} حلقة</span>
            </h2>
          </div>

          {episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {episodes.map((ep, i) => (
                <div 
                  key={`ep-${i}`} 
                  id={`episode-item-${i}`}
                  className="bg-gray-800/80 hover:bg-blue-600/20 border border-gray-700/60 hover:border-blue-500/60 p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all group"
                  onClick={() => {
                    const fullTitle = `${currentMedia.title} - ${ep.title}`;
                    setCurrentMedia({
                      ...currentMedia,
                      title: fullTitle,
                      url: ep.url
                    });
                    addToWatchHistory({
                      title: fullTitle,
                      url: ep.url,
                      image: currentMedia.image
                    });
                    fetchVideoLinks(ep.url);
                  }}
                >
                  <span className="font-semibold text-sm text-gray-200 group-hover:text-white truncate">{ep.title}</span>
                  <div className="w-8 h-8 rounded-lg bg-gray-700/80 group-hover:bg-blue-600 flex items-center justify-center transition-colors shrink-0 mr-2">
                    <Play className="w-4 h-4 text-gray-300 group-hover:text-white fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/40 rounded-xl border border-gray-800">
              <p className="text-gray-400">لا توجد حلقات متاحة لهذا المسلسل حالياً.</p>
            </div>
          )}
        </div>
      )}

      {/* Watch & Stream View */}
      {!loading && view === 'watch' && currentMedia && (
        <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
          <button 
            id="watch-back-btn"
            onClick={() => currentMedia.url.includes('series') || episodes.length > 0 ? setView('series') : setView('home')} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 bg-gray-800/80 hover:bg-gray-800 px-4 py-2 rounded-xl transition-colors border border-gray-700/50"
          >
            <ArrowRight className="w-4 h-4" /> عودة
          </button>
          
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-white">{currentMedia.title}</h1>
          
          {videoLinks.length > 0 ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
                <video 
                  key={`${streamMode}-${activeVideoUrl || videoLinks[0]?.url}`}
                  ref={videoRef}
                  controls 
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  src={streamMode === 'direct' ? (activeVideoUrl || videoLinks[0]?.url) : `/api/stream?url=${encodeURIComponent(activeVideoUrl || videoLinks[0]?.url)}`}
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
                  <source src={activeVideoUrl || videoLinks[0]?.url} type="video/mp4" />
                  <source src={activeVideoUrl || videoLinks[0]?.url} type="video/x-matroska" />
                  متصفحك لا يدعم مشغل الفيديو.
                </video>
              </div>

              {/* Streaming Mode Switcher Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                  <span className="font-semibold text-gray-400">طريقة التشغيل:</span>
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
                      title="تشغيل رابط الفيديو مباشرة بدون سيرفر وسيط"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>مباشر من المصدر (Direct)</span>
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
                      title="تشغيل الفيديو عبر سيرفر البروكسي الداخلي لتفادي قيود CORS"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-300" />
                      <span>عبر الوسيط (Proxy)</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 font-mono dir-ltr truncate max-w-xs md:max-w-md">
                  {streamMode === 'direct' ? '⚡ Direct Source Mode (HTML5)' : '🛡️ Proxied Range Stream (/api/stream)'}
                </div>
              </div>

              {videoError && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-xl text-center text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      {streamMode === 'direct'
                        ? 'تعذر التشغيل المباشر من المصدر (قد يمنع خادم الفيديو طلبات CORS أو النطاق العريض).'
                        : 'قد يكون رابط البث المباشر قد انتهت صلاحيته من المصدر أو يتطلب تحديثاً.'}
                    </p>
                    <p className="text-xs text-yellow-400/80 mt-1">
                      {streamMode === 'direct' 
                        ? 'يمكنك تجربة التبديل إلى "عبر الوسيط (Proxy)" أو فتح الرابط مباشرة في نافذة جديدة.' 
                        : 'يمكنك النقر على "تحديث الرابط" لإعادة التوليد فوراً.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {streamMode === 'direct' ? (
                      <button 
                        onClick={() => {
                          setStreamMode('proxy');
                          setVideoError(false);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-md shadow-blue-500/20"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        التبديل إلى الوسيط (Proxy)
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setStreamMode('direct');
                          setVideoError(false);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        تجربة التشغيل المباشر
                      </button>
                    )}
                    <button 
                      onClick={() => fetchVideoLinks(currentMedia.url)}
                      className="px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg flex items-center gap-1 text-xs transition-colors"
                      title="توليد رابط طازج"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      تحديث الرابط
                    </button>
                    {activeVideoUrl && (
                      <a 
                        href={activeVideoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg flex items-center gap-1 text-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        فتح في نافذة جديدة
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Controls Bar: Quality Selector & Download */}
              <div className="bg-gray-800/90 border border-gray-700/60 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                  <span className="text-gray-400 text-sm font-medium ml-2">الجودة المتوفرة:</span>
                  {videoLinks.map((link, idx) => (
                    <button 
                      key={`quality-${idx}`}
                      id={`quality-btn-${idx}`}
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
                  {/* Embed Video Button */}
                  <button 
                    id="embed-video-btn"
                    onClick={() => {
                      setEmbedVideoUrl(activeVideoUrl || videoLinks[0]?.url || currentMedia.url);
                      setEmbedTitle(currentMedia.title);
                      setIsEmbedOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 hover:scale-102"
                    title="الحصول على كود تضمين متجاوب للموقع"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>تضمين (Embed)</span>
                  </button>

                  {activeVideoUrl && (
                    <a 
                      id="direct-open-link"
                      href={activeVideoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold text-gray-200 transition-colors"
                      title="فتح الرابط المباشر"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">رابط مباشر</span>
                    </a>
                  )}
                  
                  <a 
                    id="download-btn"
                    href={`/api/download?url=${encodeURIComponent(activeVideoUrl || videoLinks[0].url)}&title=${encodeURIComponent(currentMedia.title)}`}
                    download
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-green-600/20 hover:scale-102"
                  >
                    <Download className="w-5 h-5" />
                    تحميل ({videoLinks[selectedQualityIdx]?.quality || 'الفيديو'})
                  </a>
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-20 bg-gray-800/40 border border-gray-800 rounded-2xl">
               <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
               <p className="text-lg text-gray-300 font-medium">لم يتم العثور على روابط تشغيل لهذا العنصر.</p>
               <p className="text-sm text-gray-500 mt-1">قد يكون المحتوى قيد التحديث في المصدر.</p>
             </div>
          )}
        </div>
      )}

      {/* Embed Code Modal */}
      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        defaultVideoUrl={embedVideoUrl}
        defaultTitle={embedTitle}
      />
    </div>
  );
}

