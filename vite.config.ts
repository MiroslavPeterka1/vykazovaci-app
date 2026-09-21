import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const srcPath = new URL('./src', import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': srcPath } },
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
