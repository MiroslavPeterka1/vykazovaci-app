import { addDoc, deleteDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';

import { durationMinutes } from '../domain/duration';
import type { ActivityFormValues } from '../domain/schemas';
import { fromDateInputValue, fromDateTimeLocalValue } from '../domain/time';
import type { Activity } from '../domain/types';
import { activitiesCollection, activityDoc } from './collections';

/**
 * `running` a `durationMinutes` jsou odvozená pole, která se dopočítávají při
 * každém zápisu:
 * - `running` proto, že nerovnost nad `end` by ve Firestore vynutila řazení
 *   podle `end`, a Přehled potřebuje řadit podle `start`.
 * - `durationMinutes` proto, aby šly součty dělat bez načtení všech činností.
 */
function toDocument(values: ActivityFormValues) {
  const start = fromDateTimeLocalValue(values.start);
  if (!start) throw new Error('Činnost nemá platný začátek.');
  const end = values.end ? fromDateTimeLocalValue(values.end) : null;
  const invoiceDate = values.invoiced ? fromDateInputValue(values.invoiceDate) : null;

  return {
    name: values.name.trim(),
    customerId: values.customerId,
    start: Timestamp.fromDate(start),
    end: end ? Timestamp.fromDate(end) : null,
    running: end === null,
    durationMinutes: end ? durationMinutes(start, end) : null,
    invoiced: values.invoiced,
    invoiceDate: invoiceDate ? Timestamp.fromDate(invoiceDate) : null,
    note: values.note.trim(),
    updatedAt: serverTimestamp(),
  };
}

export async function createActivity(uid: string, values: ActivityFormValues): Promise<string> {
  const created = await addDoc(activitiesCollection(uid), {
    ...toDocument(values),
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateActivity(
  uid: string,
  id: string,
  values: ActivityFormValues,
): Promise<void> {
  await updateDoc(activityDoc(uid, id), toDocument(values));
}

/** Ukončí běžící činnost k aktuálnímu okamžiku. */
export async function stopActivity(uid: string, activity: Activity): Promise<void> {
  const end = new Date();
  await updateDoc(activityDoc(uid, activity.id), {
    end: Timestamp.fromDate(end),
    running: false,
    durationMinutes: durationMinutes(activity.start, end),
    updatedAt: serverTimestamp(),
  });
}

/** Označí ukončenou činnost za vyfakturovanou; DUZP zůstává nepovinné. */
export async function markInvoiced(
  uid: string,
  id: string,
  invoiceDateValue: string,
  note: string,
): Promise<void> {
  const invoiceDate = fromDateInputValue(invoiceDateValue);
  await updateDoc(activityDoc(uid, id), {
    invoiced: true,
    invoiceDate: invoiceDate ? Timestamp.fromDate(invoiceDate) : null,
    note: note.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteActivity(uid: string, id: string): Promise<void> {
  await deleteDoc(activityDoc(uid, id));
}
