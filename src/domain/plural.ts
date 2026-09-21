/**
 * České skloňování po číslovce. Čeština má tři tvary, ne dva:
 * 1 zákazník · 2–4 zákazníci · 0 a 5+ zákazníků.
 */
export function plural(count: number, one: string, few: string, many: string): string {
  const absolute = Math.abs(count);
  if (absolute === 1) return one;
  if (absolute >= 2 && absolute <= 4) return few;
  return many;
}

export function withCount(count: number, one: string, few: string, many: string): string {
  return `${count} ${plural(count, one, few, many)}`;
}

export const countCustomers = (count: number): string =>
  withCount(count, 'zákazník', 'zákazníci', 'zákazníků');

export const countRecords = (count: number): string =>
  withCount(count, 'záznam', 'záznamy', 'záznamů');

export const countRunning = (count: number): string =>
  withCount(count, 'běžící činnost', 'běžící činnosti', 'běžících činností');
