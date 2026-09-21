import { defineConfig } from 'vitest/config';

/**
 * Testy bezpečnostních pravidel. Potřebují běžící Firestore emulátor, proto
 * je spouští `npm run test:rules` přes `firebase emulators:exec`, ne obyčejné
 * `npm test`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/rules.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
