import { describe, expect, it } from 'vitest';

import { countCustomers, countRecords, countRunning, plural } from './plural';

describe('plural', () => {
  it('rozlišuje všechny tři české tvary', () => {
    expect(plural(1, 'a', 'b', 'c')).toBe('a');
    expect(plural(2, 'a', 'b', 'c')).toBe('b');
    expect(plural(4, 'a', 'b', 'c')).toBe('b');
    expect(plural(5, 'a', 'b', 'c')).toBe('c');
    expect(plural(0, 'a', 'b', 'c')).toBe('c');
    expect(plural(11, 'a', 'b', 'c')).toBe('c');
    expect(plural(22, 'a', 'b', 'c')).toBe('c');
  });
});

describe('popisky počtů', () => {
  it('zákazníci', () => {
    expect(countCustomers(0)).toBe('0 zákazníků');
    expect(countCustomers(1)).toBe('1 zákazník');
    expect(countCustomers(3)).toBe('3 zákazníci');
    expect(countCustomers(50)).toBe('50 zákazníků');
  });

  it('záznamy', () => {
    expect(countRecords(0)).toBe('0 záznamů');
    expect(countRecords(1)).toBe('1 záznam');
    expect(countRecords(2)).toBe('2 záznamy');
  });

  it('běžící činnosti', () => {
    expect(countRunning(0)).toBe('0 běžících činností');
    expect(countRunning(1)).toBe('1 běžící činnost');
    expect(countRunning(2)).toBe('2 běžící činnosti');
    expect(countRunning(5)).toBe('5 běžících činností');
  });
});
