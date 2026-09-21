import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db } from './firebase';

/**
 * Smaže všechna data uživatele a nakonec i jeho účet.
 *
 * Přes Admin SDK proto, že klientské `deleteUser()` vyžaduje čerstvé přihlášení
 * — uživatele by bylo nutné před smazáním přelogovat. `recursiveDelete` navíc
 * projde i podkolekce zákazníků a činností.
 */
export const deleteAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Operace vyžaduje přihlášení.');
  }

  await db.recursiveDelete(db.doc(`users/${uid}`));
  await getAuth().deleteUser(uid);

  return { deleted: true };
});
