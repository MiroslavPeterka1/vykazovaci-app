import {
  addDoc,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import type { CustomerFormValues } from '../domain/schemas';
import { activitiesCollection, customerDoc, customersCollection } from './collections';
import { db } from './firebase';

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

/** Firestore dávka pojme nejvýš 500 zápisů. */
const BATCH_LIMIT = 500;

/**
 * Smaže zákazníka i všechny jeho činnosti.
 *
 * Zatím běží na klientovi; etapa 6 ho vymění za volatelnou Cloud Function.
 * Rozhraní zůstane stejné, takže obrazovky se měnit nebudou. Činnosti se mažou
 * první — kdyby se operace přerušila, zůstane zákazník s menším počtem činností
 * místo činností bez zákazníka.
 */
export async function deleteCustomerCascade(uid: string, customerId: string): Promise<void> {
  const activities = await getDocs(
    query(activitiesCollection(uid), where('customerId', '==', customerId)),
  );

  for (let from = 0; from < activities.docs.length; from += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const document of activities.docs.slice(from, from + BATCH_LIMIT)) {
      batch.delete(document.ref);
    }
    await batch.commit();
  }

  await deleteDoc(customerDoc(uid, customerId));
}
