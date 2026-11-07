import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OfflineIndicator } from '@/components/OfflineIndicator';

export const viewport: Viewport = {
  themeColor: '#ff1e27',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'فلك Falak — مشاهدة أحدث الأفلام والمسلسلات مترجمة مجاناً بجودة 4K/HD',
  description: 'منصة فلك لمشاهدة وتصفح أحدث الأفلام والمسلسلات العالمية بجودة فائقة وسيرفرات سريعة وترجمة ذكية.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'فلك Falak TV',
  },
  icons: {
    icon: '/pwa-192x192.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'فلك Falak — مشاهدة أحدث الأفلام والمسلسلات مترجمة مجاناً بجودة 4K/HD',
    description: 'منصة فلك لمشاهدة وتصفح أحدث الأفلام والمسلسلات العالمية بجودة فائقة وسيرفرات سريعة وترجمة ذكية.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فلك Falak — مشاهدة أحدث الأفلام والمسلسلات مترجمة مجاناً بجودة 4K/HD',
    description: 'منصة فلك لمشاهدة وتصفح أحدث الأفلام والمسلسلات العالمية بجودة فائقة وسيرفرات سريعة وترجمة ذكية.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-[#0b0c10] text-white min-h-screen font-sans flex flex-col justify-between overflow-x-hidden antialiased selection:bg-red-600 selection:text-white" suppressHydrationWarning>
        <div className="flex-1 w-full">
          {children}
        </div>
        <OfflineIndicator />
      </body>
    </html>
  );
}
