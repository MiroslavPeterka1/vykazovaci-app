import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

import { TERMS_VERSION } from '../content/terms';
import type { UserProfile } from '../domain/types';
import { auth, db } from './firebase';

export function userProfileRef(uid: string) {
  return doc(db, 'users', uid);
}

/**
 * Založí profilový dokument, pokud ještě neexistuje, a doplní chybějící jméno.
 *
 * U registrace e-mailem souhlas s podmínkami potvrzuje zaškrtávátko ve formuláři,
 * u Google přihlášení věta „Pokračováním souhlasíte…“ pod kartou — v obou případech
 * se čas souhlasu a verze podmínek ukládají sem.
 *
 * Doplnění jména tu není navíc: profil může vzniknout dřív, než mu registrace
 * stihne jméno předat. AuthProvider ho zakládá hned, jak Firebase ohlásí
 * přihlášení, a to nastane už při vytvoření účtu — tedy dřív, než se jméno
 * uloží. Bez téhle opravy by profil zůstal bez jména.
 */
export async function ensureUserProfile(user: User, displayName?: string): Promise<void> {
  const ref = userProfileRef(user.uid);
  const existing = await getDoc(ref);
  const wanted = (displayName ?? user.displayName ?? '').trim();

  if (!existing.exists()) {
    // Zápis je slučovací a jméno do něj jde jen tehdy, když ho známe.
    // Obě volání — registrace i doplnění z AuthProvideru — mohou dojít
    // k závěru, že dokument chybí, a založit ho. Kdyby to bylo přepisem,
    // vyhrálo by poslední, a to je zrovna to bez jména.
    await setDoc(
      ref,
      {
        ...(wanted ? { displayName: wanted } : {}),
        email: user.email ?? '',
        termsAcceptedAt: serverTimestamp(),
        termsVersion: TERMS_VERSION,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  const current = existing.data().displayName;
  const missing = typeof current !== 'string' || current.trim() === '';
  if (wanted && missing) {
    await updateDoc(ref, { displayName: wanted, updatedAt: serverTimestamp() });
  }
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userProfileRef(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const acceptedAt = data.termsAcceptedAt;
  return {
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    email: typeof data.email === 'string' ? data.email : '',
    termsAcceptedAt: acceptedAt instanceof Timestamp ? acceptedAt.toDate() : null,
    termsVersion: typeof data.termsVersion === 'string' ? data.termsVersion : '',
  };
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export async function registerWithEmail({
  displayName,
  email,
  password,
}: RegisterInput): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  // Profil první: aplikace se přesměruje hned, jak Firebase ohlásí přihlášení,
  // takže zbytek registrace doběhne až „za“ odchodem z přihlašovací stránky.
  // Kdyby ji uživatel v tu chvíli obnovil, musí být uložené aspoň tohle.
  await ensureUserProfile(user, displayName);
  await updateProfile(user, { displayName });
  await sendEmailVerification(user);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user);
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const { user } = await signInWithPopup(auth, provider);
  await ensureUserProfile(user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerification(): Promise<void> {
  if (!auth.currentUser) return;
  await sendEmailVerification(auth.currentUser);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Účet přes Google přichází s ověřeným e-mailem, výzva se ho tedy netýká. */
export function usesPasswordProvider(user: User): boolean {
  return user.providerData.some((provider) => provider.providerId === 'password');
}
