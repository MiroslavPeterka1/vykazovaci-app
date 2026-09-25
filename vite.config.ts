import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const srcPath = new URL('./src', import.meta.url).pathname;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Vykazovátko',
        short_name: 'Vykazovátko',
        description: 'Evidence zákazníků a vykazování odpracované doby',
        lang: 'cs',
        // Nainstalovaná aplikace se otevírá rovnou na Přehledu; nepřihlášeného
        // uživatele si routa stejně přesměruje na přihlášení.
        start_url: '/prehled',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f5f5f5',
        theme_color: '#1976d2',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Předem se ukládají jen vlastní přeložené soubory. Volání do Firebase
        // jdou na cizí doménu, service worker do nich nezasahuje — data tak
        // nikdy nejdou z cache a nemůžou se tvářit čerstvěji, než jsou.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
        globIgnores: [
          // Znakové sady, které česká aplikace nepoužije, a starší formát woff,
          // po kterém dnešní prohlížeče nesáhnou. Zůstávají v dist a v případě
          // potřeby se stáhnou, jen se nepředávají do offline cache.
          '**/*-{cyrillic,greek,vietnamese,math,symbols}-*.woff2',
          '**/*.woff',
          // ExcelJS má přes 900 kB a načítá se až při stahování výkazu. Do
          // offline cache nepatří — export si stejně žádá data z Firestore,
          // takže bez sítě neproběhne tak jako tak.
          '**/exceljs*.js',
        ],
        navigateFallback: '/index.html',
        // Firebase Hosting si drží /__/* pro vlastní potřeby (mimo jiné
        // přesměrování při přihlášení přes Google).
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  resolve: { alias: { '@': srcPath } },
  build: {
    // Části jsou vendorové balíky záměrně, výchozí hranice 500 kB je tu jen šum.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Firebase a MUI se mění jen při aktualizaci závislostí. Ve vlastních
        // částech je prohlížeč po nasazení nové verze aplikace nestahuje znovu.
        advancedChunks: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/ },
            { name: 'mui', test: /node_modules[\\/]@mui/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // Testy rules běží zvlášť přes `npm run test:rules`, potřebují emulátor.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Schválně NE Praha: doménová vrstva musí počítat správně i na stroji v jiné
    // zóně. Kdyby někde prosákl lokální čas místo Intl převodu, testy to odhalí.
    env: { TZ: 'America/New_York' },
  },
});
