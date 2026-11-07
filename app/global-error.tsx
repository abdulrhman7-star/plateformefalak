'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-gray-950 text-white flex flex-col items-center justify-center min-h-screen p-6 font-sans" suppressHydrationWarning>
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-3">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-gray-400 mb-6">عذراً، حدث خطأ أثناء تشغيل النظام. يمكنك المحاولة مرة أخرى.</p>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
