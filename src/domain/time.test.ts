import { describe, expect, it } from 'vitest';

import { durationMinutes, formatDuration } from './duration';
import {
  formatDate,
  formatDateTime,
  fromDateInputValue,
  fromDateTimeLocalValue,
  spansDstChange,
  startOfMonth,
  toDateTimeLocalValue,
  zoneOffsetMs,
} from './time';

// Testy běží pod TZ=America/New_York (viz vite.config.ts), takže cokoli, co by
// omylem sáhlo po lokálním čase stroje, tu spadne.

const HOUR = 3_600_000;

describe('zoneOffsetMs', () => {
  it('vrací letní čas (+2 h) v létě a zimní (+1 h) v zimě', () => {
    expect(zoneOffsetMs(new Date('2026-07-01T12:00:00Z'))).toBe(2 * HOUR);
    expect(zoneOffsetMs(new Date('2026-01-01T12:00:00Z'))).toBe(1 * HOUR);
  });
});

describe('fromDateTimeLocalValue', () => {
  it('bere vstup jako pražský čas nezávisle na zóně stroje', () => {
    // 20. 9. 2026 je letní čas, tedy +2 h proti UTC.
    expect(fromDateTimeLocalValue('2026-09-20T16:42')?.toISOString()).toBe(
      '2026-09-20T14:42:00.000Z',
    );
  });

  it('je zpětně převoditelná na stejnou hodnotu', () => {
    const value = '2026-02-14T08:05';
    const instant = fromDateTimeLocalValue(value);
    expect(instant).not.toBeNull();
    expect(toDateTimeLocalValue(instant)).toBe(value);
  });

  it('prázdný nebo nesmyslný vstup dá null', () => {
    expect(fromDateTimeLocalValue('')).toBeNull();
    expect(fromDateTimeLocalValue('nesmysl')).toBeNull();
  });

  it('neexistující čas při přechodu na letní čas posune dopředu', () => {
    // 29. 3. 2026 se ve 2:00 přeskočí na 3:00 — čas 02:30 neexistuje.
    const instant = fromDateTimeLocalValue('2026-03-29T02:30');
    expect(toDateTimeLocalValue(instant)).toBe('2026-03-29T03:30');
  });

  it('dvojznačný čas při přechodu na zimní čas bere jako druhý výskyt', () => {
    // 25. 10. 2026 nastane 02:30 dvakrát; bereme ten už v zimním čase (+1 h).
    const instant = fromDateTimeLocalValue('2026-10-25T02:30');
    expect(instant?.toISOString()).toBe('2026-10-25T01:30:00.000Z');
  });
});

describe('výpočet doby přes změnu času', () => {
  it('den přechodu na zimní čas má 25 hodin', () => {
    const start = fromDateTimeLocalValue('2026-10-24T22:00')!;
    const end = fromDateTimeLocalValue('2026-10-25T06:00')!;
    expect(durationMinutes(start, end)).toBe(9 * 60);
    expect(formatDuration(durationMinutes(start, end))).toBe('09:00');
    expect(spansDstChange(start, end)).toBe(true);
  });

  it('den přechodu na letní čas má 23 hodin', () => {
    const start = fromDateTimeLocalValue('2026-03-28T22:00')!;
    const end = fromDateTimeLocalValue('2026-03-29T06:00')!;
    expect(durationMinutes(start, end)).toBe(7 * 60);
    expect(formatDuration(durationMinutes(start, end))).toBe('07:00');
    expect(spansDstChange(start, end)).toBe(true);
  });

  it('běžná činnost změnu času nehlásí', () => {
    const start = fromDateTimeLocalValue('2026-09-20T09:00')!;
    const end = fromDateTimeLocalValue('2026-09-20T17:30')!;
    expect(spansDstChange(start, end)).toBe(false);
  });
});

describe('formatDuration', () => {
  it('formátuje na HH:MM', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(5)).toBe('00:05');
    expect(formatDuration(65)).toBe('01:05');
  });

  it('nezalamuje hodiny nad 24', () => {
    expect(formatDuration(25 * 60)).toBe('25:00');
    expect(formatDuration(100 * 60 + 7)).toBe('100:07');
  });

  it('zaokrouhluje sekundy na minuty', () => {
    const start = new Date('2026-09-20T10:00:00Z');
    expect(durationMinutes(start, new Date('2026-09-20T10:01:30Z'))).toBe(2);
    expect(durationMinutes(start, new Date('2026-09-20T10:01:29Z'))).toBe(1);
  });

  it('zápornou dobu ořízne na nulu a prázdnou zobrazí pomlčkou', () => {
    expect(formatDuration(-30)).toBe('00:00');
    expect(formatDuration(null)).toBe('—');
  });
});

describe('formátování pro zobrazení', () => {
  it('používá české pořadí a pražskou zónu', () => {
    const instant = new Date('2026-09-20T14:42:00Z');
    expect(formatDateTime(instant)).toBe('20.09.2026 16:42');
    expect(formatDate(instant)).toBe('20.09.2026');
  });

  it('prázdnou hodnotu zobrazí pomlčkou', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('fromDateInputValue a startOfMonth', () => {
  it('DUZP se ukládá jako pražská půlnoc', () => {
    expect(fromDateInputValue('2026-09-20')?.toISOString()).toBe('2026-09-19T22:00:00.000Z');
  });

  it('začátek měsíce se počítá v pražské zóně', () => {
    const instant = new Date('2026-09-20T14:42:00Z');
    expect(startOfMonth(instant).toISOString()).toBe('2026-08-31T22:00:00.000Z');
  });

  it('funguje i na přelomu měsíce, kdy se UTC a Praha liší v datu', () => {
    // 30. 9. 23:30 UTC už je v Praze 1. 10. 01:30.
    const instant = new Date('2026-09-30T23:30:00Z');
    expect(startOfMonth(instant).toISOString()).toBe('2026-09-30T22:00:00.000Z');
  });
});
