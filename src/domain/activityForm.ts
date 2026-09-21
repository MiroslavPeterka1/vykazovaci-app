import type { ActivityFormValues } from './schemas';
import { toDateInputValue, toDateTimeLocalValue } from './time';
import type { Activity } from './types';

/** Nová činnost začíná teď a nemá konec — tedy rovnou běží. */
export function newActivityForm(customerId = '', now = new Date()): ActivityFormValues {
  return {
    name: '',
    customerId,
    start: toDateTimeLocalValue(now),
    end: '',
    invoiced: false,
    invoiceDate: '',
    note: '',
  };
}

export function toActivityForm(activity: Activity): ActivityFormValues {
  return {
    name: activity.name,
    customerId: activity.customerId,
    start: toDateTimeLocalValue(activity.start),
    end: toDateTimeLocalValue(activity.end),
    invoiced: activity.invoiced,
    invoiceDate: toDateInputValue(activity.invoiceDate),
    note: activity.note,
  };
}
