import { describe, expect, it } from 'vitest';

import { customerTotals } from './totals';
import { fromDateTimeLocalValue } from './time';
import type { Activity } from './types';

function activity(overrides: Partial<Activity>): Activity {
  return {
    id: 'a',
    customerId: 'c1',
    name: 'Práce',
    start: fromDateTimeLocalValue('2026-09-10T09:00')!,
    end: fromDateTimeLocalValue('2026-09-10T11:00')!,
    durationMinutes: 120,
    invoiced: false,
    invoiceDate: null,
    note: '',
    ...overrides,
  };
}

const now = fromDateTimeLocalValue('2026-09-21T12:00')!;

describe('customerTotals', () => {
  it('sečte ukončené činnosti', () => {
    const totals = customerTotals([activity({ id: 'a1' }), activity({ id: 'a2' })], now);
    expect(totals.totalMinutes).toBe(240);
  });

  it('běžící činnost do součtu nepatří, dokud nemá konec', () => {
    const totals = customerTotals([activity({ id: 'a1' }), activity({ id: 'a2', end: null })], now);
    expect(totals.totalMinutes).toBe(120);
  });

  it('odděluje vyfakturované', () => {
    const totals = customerTotals(
      [activity({ id: 'a1', invoiced: true }), activity({ id: 'a2' })],
      now,
    );
    expect(totals.totalMinutes).toBe(240);
    expect(totals.invoicedMinutes).toBe(120);
  });

  it('do měsíce počítá jen činnosti od jeho začátku', () => {
    const totals = customerTotals(
      [
        activity({
          id: 'stary',
          start: fromDateTimeLocalValue('2026-08-31T23:00')!,
          end: fromDateTimeLocalValue('2026-09-01T00:00')!,
        }),
        activity({ id: 'novy' }),
      ],
      now,
    );
    expect(totals.totalMinutes).toBe(180);
    expect(totals.monthMinutes).toBe(120);
  });

  it('činnost přes změnu času přispěje správnou dobou', () => {
    const totals = customerTotals(
      [
        activity({
          id: 'dst',
          start: fromDateTimeLocalValue('2026-10-24T22:00')!,
          end: fromDateTimeLocalValue('2026-10-25T06:00')!,
        }),
      ],
      fromDateTimeLocalValue('2026-10-26T12:00')!,
    );
    expect(totals.totalMinutes).toBe(9 * 60);
  });

  it('prázdný seznam dá samé nuly', () => {
    expect(customerTotals([], now)).toEqual({
      totalMinutes: 0,
      invoicedMinutes: 0,
      monthMinutes: 0,
      monthInvoicedMinutes: 0,
    });
  });
});
