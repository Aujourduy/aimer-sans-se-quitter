import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

// Site déployé sur GitHub Pages avec le domaine personnalisé danphu.com.
// Le domaine sert le site à la racine, donc `base` vaut '/'.
// Le fichier public/CNAME (copié tel quel dans le build) maintient le
// domaine personnalisé à chaque déploiement par GitHub Actions.
// Pour revenir à l'URL github.io : site 'https://aujourduy.github.io'
// + base '/aimer-sans-se-quitter', et supprimer public/CNAME.
const base = '/';

export default defineConfig({
  site: 'https://danphu.com',
  base,
  // Serveur de dev uniquement (astro dev) : autorise l'accès via le nom
  // Tailscale, pour consulter le site de dev (brouillons compris) sur mobile
  // en HTTPS (tailscale serve → 127.0.0.1:4322). Sans effet sur le build/prod.
  vite: {
    server: {
      allowedHosts: ['server-dang.tail4fa970.ts.net'],
    },
  },
  integrations: [
    // PWA : installable + lecture hors-ligne. Service worker généré par Workbox
    // (pas de SW écrit à la main). `autoUpdate` → le SW se met à jour seul
    // (skipWaiting + clientsClaim) : pas de contenu périmé.
    AstroPWA({
      registerType: 'autoUpdate',
      // scope / base base-aware : tiennent sous sous-chemin comme à la racine.
      scope: base,
      base,
      manifest: {
        name: 'Dan Phu — Aimer sans se quitter',
        short_name: 'Dan Phu',
        lang: 'fr',
        dir: 'ltr',
        display: 'standalone',
        start_url: base,
        scope: base,
        // Crème du site (token --creme) — aucune couleur nouvelle.
        background_color: '#F4EFE6',
        theme_color: '#F4EFE6',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // En ligne, toujours la dernière version ; hors-ligne, repli sur le cache.
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            // Pages HTML / textes : NetworkFirst (frais en ligne, lisible hors-ligne).
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Polices auto-hébergées (versionnées) : CacheFirst.
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // CSS, JS, images : StaleWhileRevalidate.
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
