import { addDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import type { CustomerFormValues } from '../domain/schemas';
import { activitiesCollection, customerDoc, customersCollection } from './collections';
import { functions } from './firebase';

/**
 * Počítadla `totalMinutes` a `invoicedMinutes` se záměrně nezakládají — patří
 * Cloud Function triggeru a klient do nich nesmí zapisovat. Dokud tam nejsou,
 * převodník je čte jako nulu.
 */
export async function createCustomer(uid: string, values: CustomerFormValues): Promise<string> {
  const created = await addDoc(customersCollection(uid), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateCustomer(
  uid: string,
  id: string,
  values: CustomerFormValues,
): Promise<void> {
  await updateDoc(customerDoc(uid, id), { ...values, updatedAt: serverTimestamp() });
}

/** Kolik činností smazání zákazníka zasáhne — dialog to ukazuje před potvrzením. */
export async function countCustomerActivities(uid: string, customerId: string): Promise<number> {
  const snapshot = await getDocs(
    query(activitiesCollection(uid), where('customerId', '==', customerId)),
  );
  return snapshot.size;
}

const callDeleteCustomer = httpsCallable<{ customerId: string }, { deletedActivities: number }>(
  functions,
  'deleteCustomer',
);

/**
 * Smaže zákazníka i všechny jeho činnosti.
 *
 * Dělá to Cloud Function, ne klient: Firestore kaskádu nemá a dávky spuštěné
 * z prohlížeče by se při zavření okna nedotáhly a zůstaly by osiřelé činnosti.
 */
export async function deleteCustomerCascade(customerId: string): Promise<number> {
  const result = await callDeleteCustomer({ customerId });
  return result.data.deletedActivities;
}
