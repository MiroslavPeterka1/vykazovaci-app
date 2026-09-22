import { httpsCallable } from 'firebase/functions';

import { functions } from './firebase';

const callDeleteAccount = httpsCallable<void, { deleted: boolean }>(functions, 'deleteAccount');

/**
 * Smaže všechna data uživatele i jeho účet.
 *
 * Dělá to Cloud Function přes Admin SDK — klientské `deleteUser()` vyžaduje
 * čerstvé přihlášení, takže by uživatele nutilo se před smazáním znovu
 * přihlásit. Po návratu je účet pryč, takže klientovi zbývá jen odhlášení.
 */
export async function deleteAccount(): Promise<void> {
  await callDeleteAccount();
}
