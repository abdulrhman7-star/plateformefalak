import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Moviey - Akwam Streamer',
    short_name: 'Moviey',
    description: 'منصة لمشاهدة وتحميل الأفلام والمسلسلات بجودة عالية وبدون إعلانات.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#07080b',
    theme_color: '#ff1e27',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
