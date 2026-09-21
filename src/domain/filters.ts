import { formatDateTime } from './time';
import type { Activity, Customer } from './types';

/**
 * Hledání je necitlivé na velikost písmen i na diakritiku, takže "cermak"
 * najde "Čermák" — u českých názvů firem se jinak hledá špatně.
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Prázdný filtr projde vždy. */
export function matchesText(haystack: string, needle: string): boolean {
  const trimmed = needle.trim();
  if (!trimmed) return true;
  return normalize(haystack).includes(normalize(trimmed));
}

/**
 * České řazení. Firestore řadí podle bajtů UTF-8, takže „Čermák“ by skončil
 * až za „Zenit“ — háčky a čárky mají vyšší kódy než celá základní abeceda.
 * Zákazníky máme stejně celé na klientovi, takže se řadí až tady.
 */
const czechCollator = new Intl.Collator('cs', { sensitivity: 'base', numeric: true });

export function sortCustomersByName(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => czechCollator.compare(a.name, b.name));
}

export interface CustomerFilters {
  /** Fulltext nad všemi atributy zákazníka, včetně těch, které nejsou ve sloupcích. */
  fulltext: string;
  name: string;
  ico: string;
  address: string;
  person: string;
}

export const emptyCustomerFilters: CustomerFilters = {
  fulltext: '',
  name: '',
  ico: '',
  address: '',
  person: '',
};

function customerHaystack(customer: Customer): string {
  return [
    customer.name,
    customer.ico,
    customer.dic,
    customer.address,
    customer.person,
    customer.phone,
    customer.email,
  ].join(' ');
}

/** Fulltext a filtry nad sloupci se kombinují logickým AND. */
export function filterCustomers(customers: Customer[], filters: CustomerFilters): Customer[] {
  return customers.filter(
    (customer) =>
      matchesText(customerHaystack(customer), filters.fulltext) &&
      matchesText(customer.name, filters.name) &&
      matchesText(customer.ico, filters.ico) &&
      matchesText(customer.address, filters.address) &&
      matchesText(customer.person, filters.person),
  );
}

export type InvoicedFilter = 'all' | 'yes' | 'no';

export interface ActivityFilters {
  name: string;
  /** Hledá v naformátovaném začátku, takže "25.10." projde jako v návrhu. */
  start: string;
  invoiced: InvoicedFilter;
  note: string;
}

export const emptyActivityFilters: ActivityFilters = {
  name: '',
  start: '',
  invoiced: 'all',
  note: '',
};

export function filterActivities(activities: Activity[], filters: ActivityFilters): Activity[] {
  return activities.filter((activity) => {
    if (!matchesText(activity.name, filters.name)) return false;
    if (!matchesText(formatDateTime(activity.start), filters.start)) return false;
    if (!matchesText(activity.note, filters.note)) return false;
    if (filters.invoiced === 'yes' && !activity.invoiced) return false;
    if (filters.invoiced === 'no' && activity.invoiced) return false;
    return true;
  });
}

/** Výřez jedné stránky ze seznamu filtrovaného na klientovi. */
export function page<T>(items: T[], pageIndex: number, pageSize: number): T[] {
  const from = pageIndex * pageSize;
  return items.slice(from, from + pageSize);
}

/** Popisek stránkování v podobě "1–10 z 240". */
export function pageRangeLabel(total: number, pageIndex: number, pageSize: number): string {
  if (total === 0) return '0 z 0';
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, total);
  return `${from}–${to} z ${total}`;
}
