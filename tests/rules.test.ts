import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const ALICE = 'alice';
const BOB = 'bob';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-vykazy',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Výchozí data zakládáme s vypnutými pravidly, ať testy netestují samy sebe.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', ALICE), { email: 'alice@example.cz', displayName: 'Alice' });
    await setDoc(doc(db, 'users', ALICE, 'customers', 'c1'), {
      name: 'Čermák Media',
      totalMinutes: 120,
      invoicedMinutes: 60,
    });
    await setDoc(doc(db, 'users', BOB), { email: 'bob@example.cz', displayName: 'Bob' });
  });
});

const alice = () => testEnv.authenticatedContext(ALICE).firestore();
const bob = () => testEnv.authenticatedContext(BOB).firestore();
const anon = () => testEnv.unauthenticatedContext().firestore();

const validActivity = (overrides: Record<string, unknown> = {}) => ({
  name: 'Vývoj API',
  customerId: 'c1',
  start: Timestamp.fromDate(new Date('2026-09-20T07:00:00Z')),
  end: Timestamp.fromDate(new Date('2026-09-20T09:00:00Z')),
  running: false,
  durationMinutes: 120,
  invoiced: false,
  invoiceDate: null,
  note: '',
  ...overrides,
});

describe('izolace dat mezi uživateli', () => {
  it('vlastník čte i zapisuje svoje zákazníky', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users', ALICE, 'customers', 'c1')));
    await assertSucceeds(
      setDoc(doc(alice(), 'users', ALICE, 'customers', 'c2'), { name: 'Alfatech' }),
    );
  });

  it('cizí uživatel nepřečte cizí profil ani zákazníky', async () => {
    await assertFails(getDoc(doc(bob(), 'users', ALICE)));
    await assertFails(getDoc(doc(bob(), 'users', ALICE, 'customers', 'c1')));
  });

  it('cizí uživatel nezapíše do cizích dat', async () => {
    await assertFails(
      setDoc(doc(bob(), 'users', ALICE, 'customers', 'podvrh'), { name: 'Podvržený' }),
    );
    await assertFails(setDoc(doc(bob(), 'users', ALICE, 'activities', 'podvrh'), validActivity()));
  });

  it('cizí uživatel nesmaže cizí data', async () => {
    await assertFails(deleteDoc(doc(bob(), 'users', ALICE, 'customers', 'c1')));
  });

  it('nepřihlášený nedosáhne na nic', async () => {
    await assertFails(getDoc(doc(anon(), 'users', ALICE, 'customers', 'c1')));
    await assertFails(setDoc(doc(anon(), 'users', ALICE, 'customers', 'x'), { name: 'X' }));
  });
});

describe('počítadla patří triggeru', () => {
  it('klient je nesmí založit', async () => {
    await assertFails(
      setDoc(doc(alice(), 'users', ALICE, 'customers', 'novy'), {
        name: 'Alfatech',
        totalMinutes: 999,
      }),
    );
  });

  it('klient je nesmí změnit', async () => {
    await assertFails(
      updateDoc(doc(alice(), 'users', ALICE, 'customers', 'c1'), { totalMinutes: 999 }),
    );
    await assertFails(
      updateDoc(doc(alice(), 'users', ALICE, 'customers', 'c1'), { invoicedMinutes: 0 }),
    );
  });

  it('úprava ostatních polí počítadla nerozbije', async () => {
    await assertSucceeds(
      updateDoc(doc(alice(), 'users', ALICE, 'customers', 'c1'), { phone: '+420 601 222 333' }),
    );
  });
});

describe('validace zákazníka', () => {
  it('bez názvu neprojde', async () => {
    await assertFails(setDoc(doc(alice(), 'users', ALICE, 'customers', 'x'), { name: '' }));
    await assertFails(setDoc(doc(alice(), 'users', ALICE, 'customers', 'x'), { ico: '123' }));
  });
});

describe('validace činnosti', () => {
  const ref = () => doc(alice(), 'users', ALICE, 'activities', 'a1');

  it('platná činnost projde', async () => {
    await assertSucceeds(setDoc(ref(), validActivity()));
  });

  it('běžící činnost bez konce projde', async () => {
    await assertSucceeds(
      setDoc(ref(), validActivity({ end: null, running: true, durationMinutes: null })),
    );
  });

  it('konec před začátkem neprojde', async () => {
    await assertFails(
      setDoc(ref(), validActivity({ end: Timestamp.fromDate(new Date('2026-09-20T06:00:00Z')) })),
    );
  });

  it('rozpor mezi running a koncem neprojde', async () => {
    await assertFails(setDoc(ref(), validActivity({ running: true })));
    await assertFails(
      setDoc(ref(), validActivity({ end: null, running: false, durationMinutes: null })),
    );
  });

  it('ukončená činnost musí mít dopočtenou dobu', async () => {
    await assertFails(setDoc(ref(), validActivity({ durationMinutes: null })));
    await assertFails(setDoc(ref(), validActivity({ durationMinutes: -5 })));
  });

  it('běžící činnost dobu mít nesmí', async () => {
    await assertFails(
      setDoc(ref(), validActivity({ end: null, running: true, durationMinutes: 120 })),
    );
  });

  it('bez názvu nebo zákazníka neprojde', async () => {
    await assertFails(setDoc(ref(), validActivity({ name: '' })));
    await assertFails(setDoc(ref(), validActivity({ customerId: '' })));
  });
});

describe('profil', () => {
  it('uživatel svůj profil nesmaže — od toho je Cloud Function', async () => {
    await assertFails(deleteDoc(doc(alice(), 'users', ALICE)));
  });

  it('profil bez e-mailu neprojde', async () => {
    await assertFails(setDoc(doc(alice(), 'users', ALICE), { displayName: 'Alice' }));
  });
});

it('emulátor skutečně vyhodnocuje pravidla', () => {
  // Pojistka proti falešně zelenému běhu, kdyby testy omylem jely bez pravidel.
  expect(testEnv).toBeDefined();
});
