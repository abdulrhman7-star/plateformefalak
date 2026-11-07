'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-3">حدث خطأ غير متوقع</h2>
      <p className="text-gray-400 mb-6">عذراً، حدث خطأ أثناء تحميل هذه الصفحة.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all cursor-pointer"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
