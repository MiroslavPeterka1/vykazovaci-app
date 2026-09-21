import { describe, expect, it } from 'vitest';

import {
  emptyActivityFilters,
  emptyCustomerFilters,
  filterActivities,
  filterCustomers,
  matchesText,
  page,
  pageRangeLabel,
} from './filters';
import { fromDateTimeLocalValue } from './time';
import type { Activity, Customer } from './types';

function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'c1',
    name: 'Čermák Media',
    ico: '24680135',
    dic: 'CZ24680135',
    address: 'Na Příkopě 12, Praha 1',
    person: 'Petra Svobodová',
    phone: '+420 601 222 333',
    email: 'info@cermakmedia.cz',
    totalMinutes: 0,
    invoicedMinutes: 0,
    ...overrides,
  };
}

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'a1',
    customerId: 'c1',
    name: 'Vývoj API',
    start: fromDateTimeLocalValue('2026-10-25T09:00')!,
    end: fromDateTimeLocalValue('2026-10-25T11:30')!,
    durationMinutes: 150,
    invoiced: false,
    invoiceDate: null,
    note: '',
    ...overrides,
  };
}

describe('matchesText', () => {
  it('ignoruje diakritiku i velikost písmen', () => {
    expect(matchesText('Čermák Media', 'cermak')).toBe(true);
    expect(matchesText('Cermak Media', 'ČERMÁK')).toBe(true);
  });

  it('prázdný filtr projde vždy', () => {
    expect(matchesText('cokoli', '')).toBe(true);
    expect(matchesText('cokoli', '   ')).toBe(true);
  });

  it('neshodu odmítne', () => {
    expect(matchesText('Čermák Media', 'novak')).toBe(false);
  });
});

describe('filterCustomers', () => {
  const customers = [
    customer(),
    customer({
      id: 'c2',
      name: 'Novák s.r.o.',
      ico: '11112222',
      dic: 'CZ11112222',
      address: 'Masarykova 5, Brno',
      person: 'Jan Novák',
      phone: '+420 777 111 222',
      email: 'info@novak.cz',
    }),
  ];

  it('fulltext hledá i v atributech mimo sloupce tabulky', () => {
    const found = filterCustomers(customers, { ...emptyCustomerFilters, fulltext: 'CZ24680135' });
    expect(found.map((c) => c.id)).toEqual(['c1']);
  });

  it('filtry nad sloupci se kombinují s fulltextem přes AND', () => {
    const found = filterCustomers(customers, {
      ...emptyCustomerFilters,
      fulltext: 'praha',
      name: 'novak',
    });
    expect(found).toHaveLength(0);
  });

  it('bez filtrů vrací vše', () => {
    expect(filterCustomers(customers, emptyCustomerFilters)).toHaveLength(2);
  });
});

describe('filterActivities', () => {
  const activities = [
    activity(),
    activity({ id: 'a2', name: 'Konzultace', invoiced: true, note: 'Faktura 2026/0143' }),
    activity({ id: 'a3', name: 'Školení', start: fromDateTimeLocalValue('2026-09-01T08:00')! }),
  ];

  it('filtruje podle stavu fakturace', () => {
    expect(
      filterActivities(activities, { ...emptyActivityFilters, invoiced: 'yes' }).map((a) => a.id),
    ).toEqual(['a2']);
    expect(
      filterActivities(activities, { ...emptyActivityFilters, invoiced: 'no' }).map((a) => a.id),
    ).toEqual(['a1', 'a3']);
  });

  it('filtr začátku hledá v naformátovaném datu', () => {
    const found = filterActivities(activities, { ...emptyActivityFilters, start: '25.10.' });
    expect(found.map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('filtruje podle poznámky', () => {
    const found = filterActivities(activities, { ...emptyActivityFilters, note: '2026/0143' });
    expect(found.map((a) => a.id)).toEqual(['a2']);
  });
});

describe('stránkování', () => {
  const items = Array.from({ length: 23 }, (_, i) => i);

  it('vrací správnou stránku', () => {
    expect(page(items, 0, 10)).toHaveLength(10);
    expect(page(items, 2, 10)).toEqual([20, 21, 22]);
    expect(page(items, 3, 10)).toEqual([]);
  });

  it('popisek odpovídá návrhu', () => {
    expect(pageRangeLabel(23, 0, 10)).toBe('1–10 z 23');
    expect(pageRangeLabel(23, 2, 10)).toBe('21–23 z 23');
    expect(pageRangeLabel(0, 0, 10)).toBe('0 z 0');
  });
});
