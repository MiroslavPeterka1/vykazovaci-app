import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const srcPath = new URL('./src', import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
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
