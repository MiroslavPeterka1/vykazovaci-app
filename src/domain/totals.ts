import { durationMinutes } from './duration';
import { startOfMonth } from './time';
import type { Activity } from './types';

export interface CustomerTotals {
  totalMinutes: number;
  invoicedMinutes: number;
  monthMinutes: number;
  monthInvoicedMinutes: number;
}

/**
 * Čtyři hodnoty z karty „Přehled“ v detailu zákazníka.
 *
 * Počítají se jen z ukončených činností — běžící zatím nemají konec, takže by
 * do součtu vnesly dobu, která se ještě mění. Hranice měsíce se bere v pražské
 * zóně, ne v UTC.
 */
export function customerTotals(activities: Activity[], now: Date): CustomerTotals {
  const monthStart = startOfMonth(now);
  const totals: CustomerTotals = {
    totalMinutes: 0,
    invoicedMinutes: 0,
    monthMinutes: 0,
    monthInvoicedMinutes: 0,
  };

  for (const activity of activities) {
    if (!activity.end) continue;
    const minutes = durationMinutes(activity.start, activity.end);
    const inMonth = activity.start.getTime() >= monthStart.getTime();

    totals.totalMinutes += minutes;
    if (activity.invoiced) totals.invoicedMinutes += minutes;
    if (inMonth) totals.monthMinutes += minutes;
    if (inMonth && activity.invoiced) totals.monthInvoicedMinutes += minutes;
  }

  return totals;
}
