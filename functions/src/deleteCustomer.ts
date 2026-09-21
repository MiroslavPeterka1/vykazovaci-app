import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { BATCH_LIMIT, db } from './firebase';

/**
 * Smaže zákazníka i všechny jeho činnosti.
 *
 * Firestore kaskádu nemá a klient by dávky nedotáhl spolehlivě — když uživatel
 * zavře prohlížeč uprostřed, zůstanou osiřelé činnosti. Proto to dělá funkce.
 */
export const deleteCustomer = onCall<{ customerId?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Operace vyžaduje přihlášení.');
  }

  const customerId = request.data?.customerId;
  if (!customerId || typeof customerId !== 'string') {
    throw new HttpsError('invalid-argument', 'Chybí identifikátor zákazníka.');
  }

  const customerRef = db.doc(`users/${uid}/customers/${customerId}`);
  if (!(await customerRef.get()).exists) {
    throw new HttpsError('not-found', 'Zákazník neexistuje.');
  }

  const activities = db.collection(`users/${uid}/activities`).where('customerId', '==', customerId);

  let deleted = 0;
  for (;;) {
    const page = await activities.limit(BATCH_LIMIT).get();
    if (page.empty) break;

    const batch = getFirestore().batch();
    for (const document of page.docs) batch.delete(document.ref);
    await batch.commit();
    deleted += page.size;

    if (page.size < BATCH_LIMIT) break;
  }

  // Zákazník se maže až nakonec: kdyby operace spadla, zůstane zákazník
  // s méně činnostmi, ne činnosti bez zákazníka.
  await customerRef.delete();

  return { deletedActivities: deleted };
});
