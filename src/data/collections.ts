import {
  collection,
  doc,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import type { Activity, Customer } from '../domain/types';
import { db } from './firebase';

/**
 * Data každého uživatele leží pod `users/{uid}`. Činnosti jsou samostatná
 * kolekce, ne podkolekce zákazníka — Přehled potřebuje jedním dotazem poslední
 * činnosti napříč všemi zákazníky.
 */
export function customersCollection(uid: string): CollectionReference<DocumentData> {
  return collection(db, 'users', uid, 'customers');
}

export function activitiesCollection(uid: string): CollectionReference<DocumentData> {
  return collection(db, 'users', uid, 'activities');
}

export function customerDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'customers', id);
}

export function activityDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'activities', id);
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const count = (value: unknown): number => (typeof value === 'number' ? value : 0);
const date = (value: unknown): Date | null => (value instanceof Timestamp ? value.toDate() : null);

export function toCustomer(snapshot: QueryDocumentSnapshot | DocumentSnapshot): Customer {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    name: text(data.name),
    ico: text(data.ico),
    dic: text(data.dic),
    address: text(data.address),
    person: text(data.person),
    phone: text(data.phone),
    email: text(data.email),
    // Pole přibylo později, starší dokumenty ho nemají — migrace není potřeba.
    note: text(data.note),
    totalMinutes: count(data.totalMinutes),
    invoicedMinutes: count(data.invoicedMinutes),
  };
}

export function toActivity(snapshot: QueryDocumentSnapshot | DocumentSnapshot): Activity {
  const data = snapshot.data() ?? {};
  const start = date(data.start);
  if (!start) throw new Error(`Činnost ${snapshot.id} nemá začátek.`);
  return {
    id: snapshot.id,
    customerId: text(data.customerId),
    name: text(data.name),
    start,
    end: date(data.end),
    durationMinutes: typeof data.durationMinutes === 'number' ? data.durationMinutes : null,
    invoiced: data.invoiced === true,
    invoiceDate: date(data.invoiceDate),
    note: text(data.note),
  };
}
